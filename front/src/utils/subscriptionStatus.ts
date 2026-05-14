export type SubscriptionStatus = 'active' | 'expired' | 'amateur';

export function getSubscriptionStatus(
  subscriptionType?: string | null,
  subscriptionExpiresAt?: string | null,
): SubscriptionStatus {
  if (!subscriptionType || subscriptionType === 'Amateur') return 'amateur';
  if (subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date()) return 'active';
  return 'expired';
}
