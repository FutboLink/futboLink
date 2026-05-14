import { isSubscriptionActive } from './subscription-status.util';

describe('isSubscriptionActive', () => {
  it('returns false for Amateur regardless of expiresAt', () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(isSubscriptionActive({ subscriptionType: 'Amateur', subscriptionExpiresAt: future })).toBe(false);
  });

  it('returns true for Semiprofesional with a future expiresAt', () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(isSubscriptionActive({ subscriptionType: 'Semiprofesional', subscriptionExpiresAt: future })).toBe(true);
  });

  it('returns false for Semiprofesional with a past expiresAt', () => {
    const past = new Date(Date.now() - 86_400_000);
    expect(isSubscriptionActive({ subscriptionType: 'Semiprofesional', subscriptionExpiresAt: past })).toBe(false);
  });

  it('returns false for Semiprofesional with null expiresAt', () => {
    expect(isSubscriptionActive({ subscriptionType: 'Semiprofesional', subscriptionExpiresAt: null })).toBe(false);
  });

  it('returns true for Profesional with a future expiresAt', () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(isSubscriptionActive({ subscriptionType: 'Profesional', subscriptionExpiresAt: future })).toBe(true);
  });
});
