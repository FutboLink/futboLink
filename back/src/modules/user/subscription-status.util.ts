export function isSubscriptionActive(user: {
  subscriptionType?: string | null;
  subscriptionExpiresAt?: Date | string | null;
}): boolean {
  return (
    user.subscriptionType !== 'Amateur' &&
    !!user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date()
  );
}

/**
 * "Vencido": expiresAt no nulo y ya pasó (<=). NO exige type != 'Amateur' a propósito:
 * así captura tanto al recién-vencido (aún con tier premium, ventana <24h antes de que
 * corra el cron) como al ya-degradado (type=Amateur + expiresAt pasado no-nulo).
 * expiresAt=null ("nunca pagó") siempre da false.
 */
export function isSubscriptionExpired(
  user: { subscriptionType?: string | null; subscriptionExpiresAt?: Date | string | null },
  now: Date = new Date(),
): boolean {
  if (!user.subscriptionExpiresAt) return false;
  return new Date(user.subscriptionExpiresAt) <= now;
}

/**
 * "Por vencer": tier pago activo cuyo expiresAt cae dentro de la ventana
 * (now, now + thresholdDays] (límite superior inclusivo). Subset de "activo".
 */
export function isSubscriptionExpiring(
  user: { subscriptionType?: string | null; subscriptionExpiresAt?: Date | string | null },
  thresholdDays: number = 3,
  now: Date = new Date(),
): boolean {
  if (user.subscriptionType === 'Amateur' || !user.subscriptionExpiresAt) return false;
  const expiresAt = new Date(user.subscriptionExpiresAt);
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  return expiresAt.getTime() > now.getTime() && expiresAt.getTime() <= now.getTime() + thresholdMs;
}

export type SubscriptionStatusFilter = 'active' | 'expired' | 'expiring';

/**
 * Genera la condición SQL (parametrizada) que espeja isSubscriptionActive /
 * isSubscriptionExpired / isSubscriptionExpiring, para reusar entre el cron
 * (Fase 3/4) y los filtros admin (Fase 5) sin duplicar strings.
 * "expiring" usa el umbral de 3 días — fijo, coherente con el email de renovación.
 */
export function buildSubscriptionStatusClause(
  status: SubscriptionStatusFilter,
  alias: string = 'user',
): { sql: string; params: Record<string, Date> } {
  const now = new Date();

  if (status === 'active') {
    return {
      sql: `${alias}.subscriptionType != 'Amateur' AND ${alias}.subscriptionExpiresAt > :now`,
      params: { now },
    };
  }

  if (status === 'expired') {
    return {
      sql: `${alias}.subscriptionExpiresAt IS NOT NULL AND ${alias}.subscriptionExpiresAt <= :now`,
      params: { now },
    };
  }

  const nowPlus3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return {
    sql: `${alias}.subscriptionType != 'Amateur' AND ${alias}.subscriptionExpiresAt > :now AND ${alias}.subscriptionExpiresAt <= :nowPlus3d`,
    params: { now, nowPlus3d },
  };
}
