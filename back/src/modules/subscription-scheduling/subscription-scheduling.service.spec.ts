import { CronExpression } from '@nestjs/schedule';
import {
  SubscriptionSchedulingService,
  buildExactDayReminderWindow,
  isWithinExactDayWindow,
} from './subscription-scheduling.service';

/**
 * Fase 3 — Cron de bloqueo/downgrade (Domain B).
 * NO se testea el scheduler (no se dispara @Cron), solo el predicado/query
 * aislado de `handleExpiredDowngrade`, mockeando el Repository<User>.
 */
function makeQueryBuilderStub(overrides: { count: number; sample?: unknown[]; affected: number }) {
  const stub = {
    select: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    limit: jest.fn(),
    update: jest.fn(),
    set: jest.fn(),
    execute: jest.fn().mockResolvedValue({ affected: overrides.affected }),
    getCount: jest.fn().mockResolvedValue(overrides.count),
    getMany: jest.fn().mockResolvedValue(overrides.sample ?? []),
  };
  stub.select.mockReturnThis();
  stub.where.mockReturnThis();
  stub.andWhere.mockReturnThis();
  stub.limit.mockReturnThis();
  stub.update.mockReturnThis();
  stub.set.mockReturnThis();
  return stub;
}

function buildService(qbStub: ReturnType<typeof makeQueryBuilderStub>) {
  const userRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(qbStub),
  };
  // emailService/configService no se usan en los tests de Fase 3 (downgrade),
  // pero el constructor los requiere desde Fase 4 — se pasan como stubs vacíos.
  const service = new SubscriptionSchedulingService(
    userRepository as any,
    {} as any,
    {} as any,
  );
  return { service, userRepository };
}

describe('SubscriptionSchedulingService.handleExpiredDowngrade (T3.1)', () => {
  it('degrada a Amateur a los usuarios vencidos (happy path)', async () => {
    const qbStub = makeQueryBuilderStub({ count: 1, affected: 1 });
    const { service } = buildService(qbStub);

    const result = await service.handleExpiredDowngrade();

    expect(result).toEqual({ downgraded: 1 });
    // El WHERE de selección/downgrade espeja isSubscriptionExpired (expiresAt IS NOT NULL Y <= now)
    // combinado con type != Amateur (no re-tocar ya-degradados).
    const whereCalls = [...qbStub.where.mock.calls, ...qbStub.andWhere.mock.calls]
      .map((args) => String(args[0]))
      .join(' ');
    expect(whereCalls).toContain('subscriptionExpiresAt IS NOT NULL');
    expect(whereCalls).toContain('subscriptionExpiresAt <=');
    expect(whereCalls).toContain('subscriptionType != :amateur');
  });

  it('usuario con expiresAt=null nunca matchea la selección (edge case)', async () => {
    // count=0 simula que ningún usuario con expiresAt null entra en la selección
    const qbStub = makeQueryBuilderStub({ count: 0, affected: 0 });
    const { service } = buildService(qbStub);

    const result = await service.handleExpiredDowngrade();

    expect(result).toEqual({ downgraded: 0 });
  });

  it('corrida doble el mismo día no genera downgrade adicional (idempotencia)', async () => {
    // Primera corrida: 3 usuarios vencidos se degradan.
    const firstRunQb = makeQueryBuilderStub({ count: 3, affected: 3 });
    const { service: service1 } = buildService(firstRunQb);
    const firstResult = await service1.handleExpiredDowngrade();
    expect(firstResult).toEqual({ downgraded: 3 });

    // Segunda corrida el mismo día: ya no matchean (quedaron en Amateur tras el UPDATE),
    // count=0 y affected=0 — no-op, sin error.
    const secondRunQb = makeQueryBuilderStub({ count: 0, affected: 0 });
    const { service: service2 } = buildService(secondRunQb);
    const secondResult = await service2.handleExpiredDowngrade();
    expect(secondResult).toEqual({ downgraded: 0 });
  });
});

describe('SubscriptionSchedulingService.handleExpiredDowngrade — regresión isVerified (T3.2)', () => {
  it('el UPDATE solo setea subscriptionType, NUNCA isVerified', async () => {
    const qbStub = makeQueryBuilderStub({ count: 2, affected: 2 });
    const { service } = buildService(qbStub);

    await service.handleExpiredDowngrade();

    expect(qbStub.set).toHaveBeenCalledTimes(1);
    const setArg = qbStub.set.mock.calls[0][0];
    expect(setArg).toEqual({ subscriptionType: 'Amateur' });
    expect(setArg).not.toHaveProperty('isVerified');
  });
});

describe('SubscriptionSchedulingService — @Cron config (T3.3)', () => {
  it('handleExpiredDowngrade está registrado con timeZone UTC explícito', () => {
    const cronOptions = Reflect.getMetadata(
      'SCHEDULE_CRON_OPTIONS',
      SubscriptionSchedulingService.prototype.handleExpiredDowngrade,
    );

    expect(cronOptions).toBeDefined();
    expect(cronOptions.timeZone).toBe('UTC');
  });
});

/**
 * Fase 4 — Email de renovación (Domain C).
 * `now` fijo en UTC para que los tests sean deterministas sin importar la TZ
 * de la máquina que corre la suite (mismo criterio que el cron: UTC explícito).
 */
const FIXED_NOW = new Date('2026-07-22T10:00:00.000Z');

function makeSelectQueryBuilderStub(users: unknown[]) {
  const stub = {
    where: jest.fn(),
    andWhere: jest.fn(),
    getMany: jest.fn().mockResolvedValue(users),
  };
  stub.where.mockReturnThis();
  stub.andWhere.mockReturnThis();
  return stub;
}

function buildServiceWithEmail(users: unknown[]) {
  const qbStub = makeSelectQueryBuilderStub(users);
  const userRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(qbStub),
  };
  const emailService = {
    sendSubscriptionRenewalReminder: jest.fn().mockResolvedValue(undefined),
  };
  const configService = {
    get: jest.fn().mockReturnValue('https://futbolink.vercel.app'),
  };
  const service = new SubscriptionSchedulingService(
    userRepository as any,
    emailService as any,
    configService as any,
  );
  return { service, userRepository, emailService, qbStub };
}

describe('buildExactDayReminderWindow / isWithinExactDayWindow (T4.2)', () => {
  it('calcula la franja EXACTA del día calendario hoy+3d (start/end en UTC)', () => {
    const { start, end } = buildExactDayReminderWindow(3, FIXED_NOW);

    // FIXED_NOW = 2026-07-22 → +3d = 2026-07-25
    expect(start.toISOString()).toBe('2026-07-25T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-07-25T23:59:59.999Z');
  });

  it('expiresAt dentro de la franja exacta → seleccionado', () => {
    const expiresAt = new Date('2026-07-25T15:30:00.000Z');
    expect(isWithinExactDayWindow(expiresAt, 3, FIXED_NOW)).toBe(true);
  });

  it('expiresAt = now+5d → NO seleccionado (fuera de la franja de 3 días)', () => {
    const expiresAt = new Date('2026-07-27T10:00:00.000Z');
    expect(isWithinExactDayWindow(expiresAt, 3, FIXED_NOW)).toBe(false);
  });
});

describe('SubscriptionSchedulingService.handleRenewalReminders — guard de idempotencia en memoria (T4.3)', () => {
  it('segunda corrida el mismo día hace short-circuit sin enviar emails', async () => {
    const { service, userRepository, emailService } = buildServiceWithEmail([
      { id: '1', email: 'a@test.com', name: 'A', subscriptionType: 'Profesional', subscriptionExpiresAt: new Date('2026-07-25T12:00:00.000Z') },
    ]);

    const first = await service.handleRenewalReminders(FIXED_NOW);
    expect(first).toEqual({ sent: 1 });
    expect(emailService.sendSubscriptionRenewalReminder).toHaveBeenCalledTimes(1);
    expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1);

    const second = await service.handleRenewalReminders(FIXED_NOW);
    expect(second).toEqual({ sent: 0 });
    // No se volvió a consultar ni a enviar — short-circuit del guard en memoria.
    expect(emailService.sendSubscriptionRenewalReminder).toHaveBeenCalledTimes(1);
    expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it('un día nuevo resetea el guard y permite volver a enviar', async () => {
    const { service, emailService } = buildServiceWithEmail([
      { id: '1', email: 'a@test.com', name: 'A', subscriptionType: 'Profesional', subscriptionExpiresAt: new Date('2026-07-25T12:00:00.000Z') },
    ]);

    await service.handleRenewalReminders(FIXED_NOW);
    expect(emailService.sendSubscriptionRenewalReminder).toHaveBeenCalledTimes(1);

    const nextDay = new Date('2026-07-23T10:00:00.000Z');
    const result = await service.handleRenewalReminders(nextDay);
    expect(result).toEqual({ sent: 1 });
    expect(emailService.sendSubscriptionRenewalReminder).toHaveBeenCalledTimes(2);
  });
});

describe('SubscriptionSchedulingService — @Cron config handleRenewalReminders (T4.4)', () => {
  it('handleRenewalReminders está registrado con EVERY_DAY_AT_8AM y timeZone UTC explícito', () => {
    const cronOptions = Reflect.getMetadata(
      'SCHEDULE_CRON_OPTIONS',
      SubscriptionSchedulingService.prototype.handleRenewalReminders,
    );

    expect(cronOptions).toBeDefined();
    expect(cronOptions.timeZone).toBe('UTC');
    expect(cronOptions.cronTime).toBe(CronExpression.EVERY_DAY_AT_8AM);
  });
});

describe('SubscriptionSchedulingService.handleRenewalReminders — integración completa (T4.5)', () => {
  it('envía el email a cada usuario elegible con los params correctos y retorna {sent: N}', async () => {
    const users = [
      { id: '1', email: 'a@test.com', name: 'A', subscriptionType: 'Profesional', subscriptionExpiresAt: new Date('2026-07-25T09:00:00.000Z') },
      { id: '2', email: 'b@test.com', name: 'B', subscriptionType: 'Semiprofesional', subscriptionExpiresAt: new Date('2026-07-25T18:00:00.000Z') },
    ];
    const { service, emailService } = buildServiceWithEmail(users);

    const result = await service.handleRenewalReminders(FIXED_NOW);

    expect(result).toEqual({ sent: 2 });
    expect(emailService.sendSubscriptionRenewalReminder).toHaveBeenCalledTimes(2);
    expect(emailService.sendSubscriptionRenewalReminder).toHaveBeenNthCalledWith(1, {
      to: 'a@test.com',
      name: 'A',
      plan: 'Profesional',
      expiresAt: users[0].subscriptionExpiresAt,
      renewUrl: expect.stringContaining('/Subs'),
    });
    expect(emailService.sendSubscriptionRenewalReminder).toHaveBeenNthCalledWith(2, {
      to: 'b@test.com',
      name: 'B',
      plan: 'Semiprofesional',
      expiresAt: users[1].subscriptionExpiresAt,
      renewUrl: expect.stringContaining('/Subs'),
    });
  });

  it('sin usuarios elegibles retorna {sent: 0} sin llamar al EmailService', async () => {
    const { service, emailService } = buildServiceWithEmail([]);

    const result = await service.handleRenewalReminders(FIXED_NOW);

    expect(result).toEqual({ sent: 0 });
    expect(emailService.sendSubscriptionRenewalReminder).not.toHaveBeenCalled();
  });
});
