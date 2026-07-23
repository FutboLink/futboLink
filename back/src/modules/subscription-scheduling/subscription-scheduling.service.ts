import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { buildSubscriptionStatusClause } from '../user/subscription-status.util';
import { EmailService } from '../Mailing/email.service';

/** Umbral de alerta de auditoría: si el downgrade afecta a más usuarios que esto,
 *  se loguea un `error` (no bloquea la corrida) para poder investigar un downgrade masivo. */
const DOWNGRADE_ALERT_THRESHOLD = 500;

/** Días de anticipación del email de renovación (Domain C, decisión #963: 3 días). */
const RENEWAL_REMINDER_DAYS_AHEAD = 3;

/**
 * Ventana EXACTA del día calendario "hoy + daysAhead" en UTC (Domain C).
 * Distinto de `buildSubscriptionStatusClause('expiring')` (rango completo de
 * `daysAhead` días, usado por el filtro admin/D5): el email debe dispararse UN
 * único día por usuario — el día exacto en que faltan `daysAhead` días — para
 * cumplir "un único aviso" (decisión #963/#3). Se calcula en UTC explícito
 * (mismo criterio que el cron) para no depender de la TZ del proceso.
 */
export function buildExactDayReminderWindow(
  daysAhead: number,
  now: Date,
): { start: Date; end: Date } {
  const target = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const start = new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      target.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const end = new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      target.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
  return { start, end };
}

/**
 * Predicado puro: `expiresAt` cae dentro de la franja exacta del día
 * calendario "hoy + daysAhead" (ver `buildExactDayReminderWindow`).
 */
export function isWithinExactDayWindow(
  expiresAt: Date,
  daysAhead: number,
  now: Date,
): boolean {
  const { start, end } = buildExactDayReminderWindow(daysAhead, now);
  return expiresAt.getTime() >= start.getTime() && expiresAt.getTime() <= end.getTime();
}

/**
 * Servicio de scheduling para el ciclo de vida de la suscripción (Etapa 2).
 * Fase 0: scaffold. Fase 3: cron de bloqueo/downgrade diario (02:00 UTC).
 * Fase 4: cron de recordatorio de renovación (08:00 UTC), mismo servicio.
 */
@Injectable()
export class SubscriptionSchedulingService {
  private readonly logger = new Logger(SubscriptionSchedulingService.name);

  /** Guard de idempotencia EN MEMORIA (decisión #963/D4 — sin columna nueva en
   *  DB, para no depender de que Render haya migrado). Formato `YYYY-MM-DD`
   *  (UTC, vía `now.toISOString().slice(0,10)`). Si el cron corre 2 veces el
   *  mismo día calendario, la segunda corrida es un no-op. Riesgo residual
   *  documentado en el diseño: no cubre múltiples instancias concurrentes. */
  private lastReminderRunDay: string | null = null;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Degrada a `subscriptionType='Amateur'` a los usuarios vencidos (Domain B).
   * Selección = `isSubscriptionExpired` (expiresAt no nulo Y <= now, vía
   * `buildSubscriptionStatusClause('expired')`) combinado con `type != 'Amateur'`
   * para no re-tocar a los ya-degradados (idempotencia natural post-update).
   * NO toca `subscriptionExpiresAt` (deja el rastro "pagó-y-venció") ni
   * `isVerified` bajo ninguna circunstancia (invariante del fix de junio).
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, { timeZone: 'UTC' })
  async handleExpiredDowngrade(): Promise<{ downgraded: number }> {
    const { sql: expiredClause, params } = buildSubscriptionStatusClause('expired', 'user');

    const count = await this.userRepository
      .createQueryBuilder('user')
      .where(expiredClause, params)
      .andWhere('user.subscriptionType != :amateur', { amateur: 'Amateur' })
      .getCount();

    if (count > 0) {
      const sample = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.email'])
        .where(expiredClause, params)
        .andWhere('user.subscriptionType != :amateur', { amateur: 'Amateur' })
        .limit(10)
        .getMany();

      this.logger.warn(
        `[handleExpiredDowngrade] ${count} suscripciones vencidas a degradar. Sample: ${JSON.stringify(sample)}`,
      );
    }

    if (count > DOWNGRADE_ALERT_THRESHOLD) {
      this.logger.error(
        `[handleExpiredDowngrade] ALERTA: downgrade masivo detectado (${count} usuarios, umbral ${DOWNGRADE_ALERT_THRESHOLD}). No se bloquea la corrida, revisar.`,
      );
    }

    // Sin alias (misma convención que otros UPDATE atómicos del proyecto, ver
    // Applications.service.ts `promoteApplicationStatus`): las columnas van sin
    // prefijo de tabla porque `.update(Entity)` no las expone bajo el alias del SELECT.
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ subscriptionType: 'Amateur' })
      .where('subscriptionExpiresAt IS NOT NULL')
      .andWhere('subscriptionExpiresAt <= :now', params)
      .andWhere('subscriptionType != :amateur', { amateur: 'Amateur' })
      .execute();

    const downgraded = result.affected ?? 0;
    this.logger.log(`[handleExpiredDowngrade] Downgrade completo: ${downgraded} usuarios degradados a Amateur.`);

    return { downgraded };
  }

  /**
   * Envía el email de recordatorio de renovación (Domain C) a los usuarios
   * cuya `subscriptionExpiresAt` cae EXACTAMENTE en el día calendario
   * "hoy + 3 días" (`buildExactDayReminderWindow`), tier pago activo.
   * Idempotencia: guard en memoria `lastReminderRunDay` — si ya corrió hoy,
   * short-circuit sin consultar ni enviar (T4.3).
   * `now` es inyectable (default `new Date()`) para testabilidad, mismo
   * patrón que los predicados puros de `subscription-status.util.ts`.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { timeZone: 'UTC' })
  async handleRenewalReminders(now: Date = new Date()): Promise<{ sent: number }> {
    const today = now.toISOString().slice(0, 10);

    if (this.lastReminderRunDay === today) {
      this.logger.log(
        `[handleRenewalReminders] Ya corrió hoy (${today}) — short-circuit, no reenvía.`,
      );
      return { sent: 0 };
    }

    const { start, end } = buildExactDayReminderWindow(
      RENEWAL_REMINDER_DAYS_AHEAD,
      now,
    );

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.subscriptionType != :amateur', { amateur: 'Amateur' })
      .andWhere('user.subscriptionExpiresAt >= :start', { start })
      .andWhere('user.subscriptionExpiresAt <= :end', { end })
      .getMany();

    const frontendDomain =
      this.configService.get<string>('FRONTEND_DOMAIN') ||
      'https://futbolink.vercel.app';
    const renewUrl = `${frontendDomain.replace(/\/+$/, '')}/Subs`;

    for (const user of users) {
      await this.emailService.sendSubscriptionRenewalReminder({
        to: user.email,
        name: user.name,
        plan: user.subscriptionType,
        expiresAt: user.subscriptionExpiresAt as Date,
        renewUrl,
      });
    }

    this.lastReminderRunDay = today;
    this.logger.log(
      `[handleRenewalReminders] Recordatorios enviados: ${users.length} usuario(s).`,
    );

    return { sent: users.length };
  }
}
