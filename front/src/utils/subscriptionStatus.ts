export type SubscriptionStatus = 'active' | 'expired' | 'expiring' | 'amateur';

// Mismo umbral (3 dias, limite superior inclusivo) que el filtro admin backend
// (buildSubscriptionStatusClause) y el email de renovacion (Fase 5, T5.5).
const EXPIRING_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

export function getSubscriptionStatus(
  subscriptionType?: string | null,
  subscriptionExpiresAt?: string | null,
): SubscriptionStatus {
  if (!subscriptionType || subscriptionType === 'Amateur') return 'amateur';
  if (!subscriptionExpiresAt) return 'expired';

  const expiresAt = new Date(subscriptionExpiresAt);
  const now = new Date();
  if (expiresAt.getTime() <= now.getTime()) return 'expired';
  if (expiresAt.getTime() <= now.getTime() + EXPIRING_THRESHOLD_MS) return 'expiring';
  return 'active';
}
