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
  const userService = {} as UserService;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      StripeService,
      { provide: getRepositoryToken(Payment), useValue: paymentRepo },
      { provide: ConfigService, useValue: configService },
      { provide: UserService, useValue: userService },
    ],
  }).compile();

  const service = module.get<StripeService>(StripeService);
  return { service, paymentRepo };
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
