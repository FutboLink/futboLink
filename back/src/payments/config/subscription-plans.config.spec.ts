import { resolvePlanByPriceId, computeExpiryDate } from './subscription-plans.config';
import { SubscriptionPlan } from '../entities/payment.entity';

const PRICE_SEMIPRO_MONTHLY = 'price_1R7MPlGbCHvHfqXFNjW8oj2k';
const PRICE_SEMIPRO_YEARLY = 'price_1R7MPlGbCHvHfqXFapD8MeOw';
const PRICE_PRO_MONTHLY = 'price_1R7MaqGbCHvHfqXFimcCzvlo';
const PRICE_PRO_YEARLY = 'price_1R7MbgGbCHvHfqXFYECGw8S9';

describe('resolvePlanByPriceId', () => {
  it('resolves Semiprofesional monthly priceId', () => {
    expect(resolvePlanByPriceId(PRICE_SEMIPRO_MONTHLY)).toEqual({
      plan: SubscriptionPlan.SEMIPROFESIONAL,
      billingPeriod: 'monthly',
      durationMonths: 1,
    });
  });

  it('resolves Semiprofesional yearly priceId', () => {
    expect(resolvePlanByPriceId(PRICE_SEMIPRO_YEARLY)).toEqual({
      plan: SubscriptionPlan.SEMIPROFESIONAL,
      billingPeriod: 'yearly',
      durationMonths: 12,
    });
  });

  it('resolves Profesional monthly priceId', () => {
    expect(resolvePlanByPriceId(PRICE_PRO_MONTHLY)).toEqual({
      plan: SubscriptionPlan.PROFESIONAL,
      billingPeriod: 'monthly',
      durationMonths: 1,
    });
  });

  it('resolves Profesional yearly priceId (edge case — bug de regresión conocido: hoy cae en AMATEUR)', () => {
    expect(resolvePlanByPriceId(PRICE_PRO_YEARLY)).toEqual({
      plan: SubscriptionPlan.PROFESIONAL,
      billingPeriod: 'yearly',
      durationMonths: 12,
    });
  });

  it('returns null for an unknown priceId', () => {
    expect(resolvePlanByPriceId('price_totally_unknown')).toBeNull();
  });

  it('returns null when priceId is undefined', () => {
    expect(resolvePlanByPriceId(undefined)).toBeNull();
  });

  it('returns null when priceId is an empty string (guard)', () => {
    expect(resolvePlanByPriceId('')).toBeNull();
  });

  it('does NOT match a quarterly priceId when the quarterly env config is not provided (guard)', () => {
    expect(resolvePlanByPriceId('price_quarterly_semipro_would_be_this')).toBeNull();
  });

  it('does NOT match when quarterly config is provided but empty/undefined values (guard)', () => {
    expect(
      resolvePlanByPriceId('price_quarterly_semipro_x', { semipro: undefined, pro: undefined }),
    ).toBeNull();
  });

  it('resolves quarterly Semiprofesional when quarterly.semipro is configured and matches', () => {
    expect(
      resolvePlanByPriceId('price_quarterly_semipro_test', { semipro: 'price_quarterly_semipro_test' }),
    ).toEqual({
      plan: SubscriptionPlan.SEMIPROFESIONAL,
      billingPeriod: 'quarterly',
      durationMonths: 3,
    });
  });

  it('resolves quarterly Profesional when quarterly.pro is configured and matches', () => {
    expect(
      resolvePlanByPriceId('price_quarterly_pro_test', { pro: 'price_quarterly_pro_test' }),
    ).toEqual({
      plan: SubscriptionPlan.PROFESIONAL,
      billingPeriod: 'quarterly',
      durationMonths: 3,
    });
  });
});

describe('computeExpiryDate', () => {
  it('adds 1 month for mensual (durationMonths=1)', () => {
    const from = new Date(2026, 0, 15); // 15 Jan 2026
    const result = computeExpiryDate(from, 1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(15);
  });

  it('adds 3 months for trimestral (durationMonths=3)', () => {
    const from = new Date(2026, 0, 15);
    const result = computeExpiryDate(from, 3);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getFullYear()).toBe(2026);
  });

  it('adds 12 months for anual (durationMonths=12) — ya no se trunca a 1 mes', () => {
    const from = new Date(2026, 0, 15);
    const result = computeExpiryDate(from, 12);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(15);
  });

  it('does not mutate the original "from" date', () => {
    const from = new Date(2026, 0, 15);
    const originalTime = from.getTime();
    computeExpiryDate(from, 1);
    expect(from.getTime()).toBe(originalTime);
  });

  it('edge case: Jan 31 + 1 month rolls over (Feb 2026 has 28 days)', () => {
    const from = new Date(2026, 0, 31); // Jan 31 2026
    const result = computeExpiryDate(from, 1);
    // JS Date.setMonth overflow behavior: Feb 31 -> rolls into March
    expect(result.getMonth()).toBe(2); // March
  });
});
