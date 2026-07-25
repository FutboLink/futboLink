import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { Payment, PaymentStatus, SubscriptionPlan } from '../entities/payment.entity';
import { UserService } from '../../modules/user/user.service';

const PRICE_SEMIPRO_MONTHLY = 'price_1R7MPlGbCHvHfqXFNjW8oj2k';
const PRICE_SEMIPRO_YEARLY = 'price_1R7MPlGbCHvHfqXFapD8MeOw';
const PRICE_PRO_MONTHLY = 'price_1R7MaqGbCHvHfqXFimcCzvlo';
const PRICE_PRO_YEARLY = 'price_1R7MbgGbCHvHfqXFYECGw8S9';

function makePaymentRepoMock() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: any) => data),
    save: jest.fn(async (p: any) => p),
  };
}

async function buildService(envOverrides: Record<string, string> = {}) {
  const paymentRepo = makePaymentRepoMock();
  const env: Record<string, string> = {
    STRIPE_SECRET_KEY: 'sk_test_dummy',
    FRONTEND_DOMAIN: 'http://localhost:3000',
    ...envOverrides,
  };
  const configService = {
    get: jest.fn((key: string) => env[key]),
  } as unknown as ConfigService;
  const userService = {
    findOneByEmail: jest.fn(),
    updateUserSubscriptionWithExpiration: jest.fn(),
  } as unknown as UserService & {
    findOneByEmail: jest.Mock;
    updateUserSubscriptionWithExpiration: jest.Mock;
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      StripeService,
      { provide: getRepositoryToken(Payment), useValue: paymentRepo },
      { provide: ConfigService, useValue: configService },
      { provide: UserService, useValue: userService },
    ],
  }).compile();

  const service = module.get<StripeService>(StripeService);
  return { service, paymentRepo, userService };
}

describe('StripeService — priceId to plan mapping centralizado (T1.3, D2)', () => {
  describe('handleSubscriptionCreated (sitio 2/5)', () => {
    it('reconoce el priceId anual de Profesional (bug de regresión: hoy cae en AMATEUR)', async () => {
      const { service, paymentRepo } = await buildService();
      paymentRepo.findOne.mockResolvedValue({ subscriptionType: undefined } as Payment);

      await (service as any).handleSubscriptionCreated({
        id: 'sub_1',
        status: 'active',
        items: { data: [{ price: { id: PRICE_PRO_YEARLY } }] },
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.PROFESIONAL }),
      );
    });

    it('reconoce el priceId anual de Semiprofesional', async () => {
      const { service, paymentRepo } = await buildService();
      paymentRepo.findOne.mockResolvedValue({ subscriptionType: undefined } as Payment);

      await (service as any).handleSubscriptionCreated({
        id: 'sub_2',
        status: 'active',
        items: { data: [{ price: { id: PRICE_SEMIPRO_YEARLY } }] },
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.SEMIPROFESIONAL }),
      );
    });

    it('cae a AMATEUR para un priceId desconocido (comportamiento preservado)', async () => {
      const { service, paymentRepo } = await buildService();
      paymentRepo.findOne.mockResolvedValue({ subscriptionType: undefined } as Payment);

      await (service as any).handleSubscriptionCreated({
        id: 'sub_3',
        status: 'active',
        items: { data: [{ price: { id: 'price_totally_unknown' } }] },
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.AMATEUR }),
      );
    });

    it('resuelve un priceId trimestral cuando la env var está configurada', async () => {
      const { service, paymentRepo } = await buildService({
        STRIPE_PRICE_QUARTERLY_PRO: 'price_quarterly_pro_env',
      });
      paymentRepo.findOne.mockResolvedValue({ subscriptionType: undefined } as Payment);

      await (service as any).handleSubscriptionCreated({
        id: 'sub_4',
        status: 'active',
        items: { data: [{ price: { id: 'price_quarterly_pro_env' } }] },
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.PROFESIONAL }),
      );
    });
  });

  describe('handleSubscriptionUpdated (sitio 3/5)', () => {
    it('setea subscriptionType desde el priceId anual cuando payment.subscriptionType aún no está seteado', async () => {
      const { service, paymentRepo } = await buildService();
      paymentRepo.findOne.mockResolvedValue({
        subscriptionType: undefined,
        status: undefined,
      } as Payment);

      await (service as any).handleSubscriptionUpdated({
        id: 'sub_5',
        status: 'active',
        items: { data: [{ price: { id: PRICE_PRO_YEARLY } }] },
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.PROFESIONAL }),
      );
    });

    it('NO sobrescribe un subscriptionType ya seteado', async () => {
      const { service, paymentRepo } = await buildService();
      paymentRepo.findOne.mockResolvedValue({
        subscriptionType: SubscriptionPlan.SEMIPROFESIONAL,
        status: undefined,
      } as Payment);

      await (service as any).handleSubscriptionUpdated({
        id: 'sub_6',
        status: 'active',
        items: { data: [{ price: { id: PRICE_PRO_MONTHLY } }] },
      });

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.SEMIPROFESIONAL }),
      );
    });
  });

  describe('checkUserSubscription (sitio 4/5) — mapeo fallback por priceId', () => {
    it('mapea el priceId anual de Profesional cuando payment.subscriptionType no está seteado', async () => {
      const { service, paymentRepo } = await buildService();
      paymentRepo.findOne.mockResolvedValue({
        status: PaymentStatus.SUCCEEDED,
        subscriptionStatus: 'active',
        subscriptionType: undefined,
        stripePriceId: PRICE_PRO_YEARLY,
      } as Payment);

      const result = await service.checkUserSubscription('user@example.com');
      expect(result.subscriptionType).toBe('Profesional');
    });
  });

  describe('createSubscriptionSession (sitio 1/5) y forceSubscriptionSync (sitio 5/5)', () => {
    it('createSubscriptionSession guarda el plan anual de Profesional para el priceId anual', async () => {
      const { service, paymentRepo } = await buildService();
      // Se reemplaza el cliente real de Stripe para no depender de red en el test.
      (service as any).stripe = {
        prices: { retrieve: jest.fn().mockRejectedValue(new Error('sin red en test')) },
        checkout: {
          sessions: { create: jest.fn().mockResolvedValue({ id: 'cs_test', url: 'http://x' }) },
        },
      };

      await service.createSubscriptionSession({
        customerEmail: 'a@b.com',
        priceId: PRICE_PRO_YEARLY,
      } as any);

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.PROFESIONAL }),
      );
    });

    it('forceSubscriptionSync resuelve el plan anual de Profesional desde la suscripción de Stripe', async () => {
      const { service, paymentRepo } = await buildService();
      paymentRepo.findOne.mockResolvedValue({
        stripeSubscriptionId: 'sub_x',
        status: PaymentStatus.PENDING,
        subscriptionType: undefined,
      } as Payment);
      (service as any).stripe = {
        subscriptions: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'sub_x',
            status: 'active',
            items: { data: [{ price: { id: PRICE_PRO_YEARLY } }] },
          }),
        },
      };

      await service.forceSubscriptionSync('a@b.com');

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionType: SubscriptionPlan.PROFESIONAL }),
      );
    });
  });
});

describe('StripeService — sync de users desde suscripciones de Stripe (fix drift 141 vs 283)', () => {
  const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

  function makeSub(overrides: Record<string, any> = {}) {
    return {
      id: 'sub_sync_1',
      status: 'active',
      current_period_end: periodEnd,
      customer: 'cus_new_123',
      items: { data: [{ price: { id: PRICE_PRO_MONTHLY } }] },
      ...overrides,
    };
  }

  describe('syncUserSubscriptionFromStripe', () => {
    it('actualiza al user (plan + expiresAt=current_period_end) usando el email del customer expandido', async () => {
      const { service, userService } = await buildService();
      userService.findOneByEmail.mockResolvedValue({ id: 'user-1', email: 'diego@x.com' });

      const result = await service.syncUserSubscriptionFromStripe(
        makeSub({ customer: { id: 'cus_new_123', email: 'diego@x.com' } }) as any,
      );

      expect(result).toBe('updated');
      expect(userService.updateUserSubscriptionWithExpiration).toHaveBeenCalledWith(
        'user-1',
        SubscriptionPlan.PROFESIONAL,
        new Date(periodEnd * 1000),
      );
    });

    it('resuelve el email desde el Payment local cuando el customer no viene expandido', async () => {
      const { service, paymentRepo, userService } = await buildService();
      paymentRepo.findOne.mockResolvedValue({ customerEmail: 'diego@x.com' } as Payment);
      userService.findOneByEmail.mockResolvedValue({ id: 'user-1', email: 'diego@x.com' });

      const result = await service.syncUserSubscriptionFromStripe(makeSub() as any);

      expect(result).toBe('updated');
      expect(userService.updateUserSubscriptionWithExpiration).toHaveBeenCalled();
    });

    it('customer NUEVO sin Payment local (re-suscripción con otro medio de pago): cae al retrieve del customer en Stripe', async () => {
      const { service, paymentRepo, userService } = await buildService();
      paymentRepo.findOne.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue({ id: 'user-1', email: 'diego@x.com' });
      (service as any).stripe = {
        customers: {
          retrieve: jest.fn().mockResolvedValue({ id: 'cus_new_123', email: 'diego@x.com' }),
        },
      };

      const result = await service.syncUserSubscriptionFromStripe(makeSub() as any);

      expect(result).toBe('updated');
      expect((service as any).stripe.customers.retrieve).toHaveBeenCalledWith('cus_new_123');
      expect(userService.updateUserSubscriptionWithExpiration).toHaveBeenCalledWith(
        'user-1',
        SubscriptionPlan.PROFESIONAL,
        new Date(periodEnd * 1000),
      );
    });

    it('no toca al user si la suscripción no está activa (canceled)', async () => {
      const { service, userService } = await buildService();

      const result = await service.syncUserSubscriptionFromStripe(
        makeSub({ status: 'canceled' }) as any,
      );

      expect(result).toBe('skipped');
      expect(userService.updateUserSubscriptionWithExpiration).not.toHaveBeenCalled();
    });

    it('no toca al user para priceIds de verificación (tilde azul, no plan)', async () => {
      const { service, userService } = await buildService();

      const result = await service.syncUserSubscriptionFromStripe(
        makeSub({ items: { data: [{ price: { id: 'price_1S5Z3lGbCHvHfqXFd1Xkxf54' } }] } }) as any,
      );

      expect(result).toBe('skipped');
      expect(userService.updateUserSubscriptionWithExpiration).not.toHaveBeenCalled();
    });

    it('no degrada por priceId desconocido (skip, no escribe Amateur)', async () => {
      const { service, userService } = await buildService();

      const result = await service.syncUserSubscriptionFromStripe(
        makeSub({ items: { data: [{ price: { id: 'price_desconocido' } }] } }) as any,
      );

      expect(result).toBe('skipped');
      expect(userService.updateUserSubscriptionWithExpiration).not.toHaveBeenCalled();
    });

    it('devuelve user-not-found si el email no matchea ningún user de la plataforma', async () => {
      const { service, userService } = await buildService();
      userService.findOneByEmail.mockResolvedValue(null);

      const result = await service.syncUserSubscriptionFromStripe(
        makeSub({ customer: { id: 'cus_new_123', email: 'fantasma@x.com' } }) as any,
      );

      expect(result).toBe('user-not-found');
      expect(userService.updateUserSubscriptionWithExpiration).not.toHaveBeenCalled();
    });
  });

  describe('webhooks que disparan el sync', () => {
    it('customer.subscription.updated sincroniza al user aunque NO exista Payment local (customer nuevo)', async () => {
      const { service, paymentRepo, userService } = await buildService();
      paymentRepo.findOne.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue({ id: 'user-1', email: 'diego@x.com' });
      (service as any).stripe = {
        customers: {
          retrieve: jest.fn().mockResolvedValue({ id: 'cus_new_123', email: 'diego@x.com' }),
        },
      };

      await (service as any).handleSubscriptionUpdated(makeSub());

      expect(userService.updateUserSubscriptionWithExpiration).toHaveBeenCalledWith(
        'user-1',
        SubscriptionPlan.PROFESIONAL,
        new Date(periodEnd * 1000),
      );
    });

    it('invoice.paid (renovación) recupera la suscripción de Stripe y extiende el expiresAt del user', async () => {
      const { service, paymentRepo, userService } = await buildService();
      paymentRepo.findOne.mockResolvedValue(null);
      userService.findOneByEmail.mockResolvedValue({ id: 'user-1', email: 'diego@x.com' });
      (service as any).stripe = {
        subscriptions: {
          retrieve: jest.fn().mockResolvedValue(
            makeSub({ customer: { id: 'cus_new_123', email: 'diego@x.com' } }),
          ),
        },
      };

      await (service as any).handleInvoicePaid({ id: 'in_1', subscription: 'sub_sync_1' });

      expect((service as any).stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_sync_1');
      expect(userService.updateUserSubscriptionWithExpiration).toHaveBeenCalledWith(
        'user-1',
        SubscriptionPlan.PROFESIONAL,
        new Date(periodEnd * 1000),
      );
    });
  });

  describe('reconcileActiveSubscriptions (backfill del drift existente)', () => {
    it('pagina las suscripciones activas de Stripe y sincroniza cada una, reportando stats', async () => {
      const { service, userService } = await buildService();
      userService.findOneByEmail
        .mockResolvedValueOnce({ id: 'user-1', email: 'a@x.com' })
        .mockResolvedValueOnce(null);
      (service as any).stripe = {
        subscriptions: {
          list: jest.fn().mockResolvedValue({
            has_more: false,
            data: [
              makeSub({ id: 'sub_a', customer: { id: 'cus_a', email: 'a@x.com' } }),
              makeSub({ id: 'sub_b', customer: { id: 'cus_b', email: 'b@x.com' } }),
            ],
          }),
        },
      };

      const stats = await service.reconcileActiveSubscriptions();

      expect((service as any).stripe.subscriptions.list).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active', limit: 100, expand: ['data.customer'] }),
      );
      expect(stats).toEqual(
        expect.objectContaining({
          processed: 2,
          updated: 1,
          userNotFound: ['b@x.com'],
        }),
      );
      expect(userService.updateUserSubscriptionWithExpiration).toHaveBeenCalledTimes(1);
    });
  });
});
