import { SubscriptionPlan } from '../entities/payment.entity';

export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface PlanDefinition {
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  durationMonths: number; // 1 | 3 | 12
}

// Env var names para los priceIds trimestrales — pendientes de crear en Stripe.
// Si no están configuradas, resolvePlanByPriceId nunca las matchea (guard).
export const QUARTERLY_PRICE_ENV = {
  semipro: 'STRIPE_PRICE_QUARTERLY_SEMIPRO',
  pro: 'STRIPE_PRICE_QUARTERLY_PRO',
} as const;

// Mapa estático de los 4 priceIds YA existentes (mensual + anual de Semipro/Pro).
export const KNOWN_PLAN_BY_PRICE_ID: Record<string, PlanDefinition> = {
  'price_1R7MPlGbCHvHfqXFNjW8oj2k': {
    plan: SubscriptionPlan.SEMIPROFESIONAL,
    billingPeriod: 'monthly',
    durationMonths: 1,
  },
  'price_1R7MPlGbCHvHfqXFapD8MeOw': {
    plan: SubscriptionPlan.SEMIPROFESIONAL,
    billingPeriod: 'yearly',
    durationMonths: 12,
  },
  'price_1R7MaqGbCHvHfqXFimcCzvlo': {
    plan: SubscriptionPlan.PROFESIONAL,
    billingPeriod: 'monthly',
    durationMonths: 1,
  },
  'price_1R7MbgGbCHvHfqXFYECGw8S9': {
    plan: SubscriptionPlan.PROFESIONAL,
    billingPeriod: 'yearly',
    durationMonths: 12,
  },
};

/**
 * Resuelve un priceId de Stripe al plan (tier + duración) correspondiente.
 * Centraliza los 5 if/else hardcodeados que existían en stripe.service.ts.
 *
 * @param priceId priceId de Stripe a resolver.
 * @param quarterly priceIds trimestrales configurados vía env var (opcionales).
 * @returns la definición del plan, o null si el priceId es desconocido/vacío.
 */
export function resolvePlanByPriceId(
  priceId: string | undefined,
  quarterly?: { semipro?: string; pro?: string },
): PlanDefinition | null {
  if (!priceId) return null;

  if (KNOWN_PLAN_BY_PRICE_ID[priceId]) {
    return KNOWN_PLAN_BY_PRICE_ID[priceId];
  }

  if (quarterly?.semipro && priceId === quarterly.semipro) {
    return {
      plan: SubscriptionPlan.SEMIPROFESIONAL,
      billingPeriod: 'quarterly',
      durationMonths: 3,
    };
  }

  if (quarterly?.pro && priceId === quarterly.pro) {
    return {
      plan: SubscriptionPlan.PROFESIONAL,
      billingPeriod: 'quarterly',
      durationMonths: 3,
    };
  }

  return null;
}

/**
 * Calcula la fecha de expiración a partir de una fecha base y una duración en meses.
 * NO trunca a 1 mes fijo (corrige el bug de user.service.ts:698-776).
 */
export function computeExpiryDate(from: Date, durationMonths: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + durationMonths);
  return d;
}
