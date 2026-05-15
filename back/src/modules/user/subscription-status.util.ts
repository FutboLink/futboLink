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
