import {
  isSubscriptionActive,
  isSubscriptionExpired,
  isSubscriptionExpiring,
  buildSubscriptionStatusClause,
} from './subscription-status.util';

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

describe('isSubscriptionExpired', () => {
  const now = new Date('2026-07-22T12:00:00.000Z');

  it('returns false when subscriptionExpiresAt is null (nunca pagó)', () => {
    expect(isSubscriptionExpired({ subscriptionExpiresAt: null }, now)).toBe(false);
  });

  it('returns true when expiresAt is exactly now (limite inclusivo)', () => {
    expect(isSubscriptionExpired({ subscriptionExpiresAt: now }, now)).toBe(true);
  });

  it('returns true when expiresAt is in the past AND type is still a paid tier (recién-vencido, cron aún no corrió)', () => {
    const past = new Date(now.getTime() - 3_600_000);
    expect(
      isSubscriptionExpired({ subscriptionType: 'Profesional', subscriptionExpiresAt: past }, now),
    ).toBe(true);
  });

  it('returns true when expiresAt is in the past AND type is already Amateur (ya-degradado)', () => {
    const past = new Date(now.getTime() - 30 * 24 * 3_600_000);
    expect(
      isSubscriptionExpired({ subscriptionType: 'Amateur', subscriptionExpiresAt: past }, now),
    ).toBe(true);
  });

  it('returns false when expiresAt is in the future', () => {
    const future = new Date(now.getTime() + 86_400_000);
    expect(isSubscriptionExpired({ subscriptionExpiresAt: future }, now)).toBe(false);
  });

  it('defaults "now" to the current time when not provided', () => {
    const past = new Date(Date.now() - 86_400_000);
    expect(isSubscriptionExpired({ subscriptionExpiresAt: past })).toBe(true);
  });
});

describe('isSubscriptionExpiring', () => {
  const now = new Date('2026-07-22T12:00:00.000Z');
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  it('returns true for a paid tier expiring within the 3-day window', () => {
    const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    expect(
      isSubscriptionExpiring({ subscriptionType: 'Profesional', subscriptionExpiresAt: soon }, 3, now),
    ).toBe(true);
  });

  it('edge case: exactly at the 3-day threshold is included (limite inclusivo)', () => {
    const exactlyThreeDays = new Date(now.getTime() + threeDaysMs);
    expect(
      isSubscriptionExpiring(
        { subscriptionType: 'Semiprofesional', subscriptionExpiresAt: exactlyThreeDays },
        3,
        now,
      ),
    ).toBe(true);
  });

  it('returns false just beyond the 3-day threshold', () => {
    const justBeyond = new Date(now.getTime() + threeDaysMs + 1000);
    expect(
      isSubscriptionExpiring({ subscriptionType: 'Profesional', subscriptionExpiresAt: justBeyond }, 3, now),
    ).toBe(false);
  });

  it('returns false for Amateur even if expiresAt falls within the window (nunca pagó o ya degradado)', () => {
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expect(
      isSubscriptionExpiring({ subscriptionType: 'Amateur', subscriptionExpiresAt: soon }, 3, now),
    ).toBe(false);
  });

  it('returns false when expiresAt already passed (that is "expired", not "expiring")', () => {
    const past = new Date(now.getTime() - 86_400_000);
    expect(
      isSubscriptionExpiring({ subscriptionType: 'Profesional', subscriptionExpiresAt: past }, 3, now),
    ).toBe(false);
  });

  it('returns false when subscriptionExpiresAt is null', () => {
    expect(
      isSubscriptionExpiring({ subscriptionType: 'Profesional', subscriptionExpiresAt: null }, 3, now),
    ).toBe(false);
  });

  it('defaults thresholdDays to 3 when not provided', () => {
    const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    expect(
      isSubscriptionExpiring({ subscriptionType: 'Profesional', subscriptionExpiresAt: soon }, undefined, now),
    ).toBe(true);
  });
});

describe('buildSubscriptionStatusClause', () => {
  it('"active" returns the paid-tier-and-not-expired SQL clause with a "now" param', () => {
    const { sql, params } = buildSubscriptionStatusClause('active');
    expect(sql).toBe("user.subscriptionType != 'Amateur' AND user.subscriptionExpiresAt > :now");
    expect(params.now).toBeInstanceOf(Date);
  });

  it('"expired" returns the SQL clause matching non-null past expiresAt (incluye ya-degradados)', () => {
    const { sql, params } = buildSubscriptionStatusClause('expired');
    expect(sql).toBe('user.subscriptionExpiresAt IS NOT NULL AND user.subscriptionExpiresAt <= :now');
    expect(params.now).toBeInstanceOf(Date);
  });

  it('"expiring" returns the full 3-day-window SQL clause with now and nowPlus3d params', () => {
    const { sql, params } = buildSubscriptionStatusClause('expiring');
    expect(sql).toBe(
      "user.subscriptionType != 'Amateur' AND user.subscriptionExpiresAt > :now AND user.subscriptionExpiresAt <= :nowPlus3d",
    );
    expect(params.now).toBeInstanceOf(Date);
    expect(params.nowPlus3d).toBeInstanceOf(Date);
    expect(params.nowPlus3d.getTime()).toBeGreaterThan(params.now.getTime());
  });

  it('honors a custom alias', () => {
    const { sql } = buildSubscriptionStatusClause('active', 'u');
    expect(sql).toBe("u.subscriptionType != 'Amateur' AND u.subscriptionExpiresAt > :now");
  });

  it('defaults alias to "user" when not provided', () => {
    const { sql } = buildSubscriptionStatusClause('expired');
    expect(sql).toContain('user.subscriptionExpiresAt');
  });
});
