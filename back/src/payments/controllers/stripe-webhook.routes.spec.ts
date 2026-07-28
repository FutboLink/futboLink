import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppController } from '../../app.controller';
import { AppService } from '../../app.service';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeService } from '../services/stripe.service';

/**
 * Resolución de rutas del webhook. Existía un segundo handler en AppController
 * (`@Post('stripe/webhook')`) que respondía 200 {received:true} ANTES de validar
 * la firma y procesaba en background tragándose los errores: Stripe veía "éxito"
 * en todos los eventos aunque no se procesara ninguno. Estos tests fijan que
 * hay UN solo handler y que un evento no procesado NUNCA devuelve 200.
 */
describe('Webhook de Stripe — resolución de rutas y honestidad del status code', () => {
  let app: INestApplication;
  const stripeService = { handleWebhookEvent: jest.fn() };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController, StripeWebhookController],
      providers: [
        { provide: StripeService, useValue: stripeService },
        { provide: AppService, useValue: { getHello: () => 'ok' } },
      ],
    }).compile();

    app = moduleRef.createNestApplication({ rawBody: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('/stripe/webhook con firma inválida devuelve 400 (hoy devuelve 200 {received:true} y Stripe nunca reintenta)', async () => {
    stripeService.handleWebhookEvent.mockRejectedValue(new Error('Invalid signature'));

    const res = await request(app.getHttpServer())
      .post('/stripe/webhook')
      .set('stripe-signature', 'sig_invalida')
      .set('Content-Type', 'application/json')
      .send({ id: 'evt_1' });

    expect(res.status).toBe(400);
    expect(res.body.received).not.toBe(true);
  });

  it('/payments/webhook con firma inválida devuelve 400', async () => {
    stripeService.handleWebhookEvent.mockRejectedValue(new Error('Invalid signature'));

    const res = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('stripe-signature', 'sig_invalida')
      .set('Content-Type', 'application/json')
      .send({ id: 'evt_1' });

    expect(res.status).toBe(400);
  });

  it('ambas rutas procesan el evento y devuelven 200 cuando la firma es válida', async () => {
    stripeService.handleWebhookEvent.mockResolvedValue({ received: true, type: 'invoice.paid' });

    for (const path of ['/stripe/webhook', '/payments/webhook']) {
      const res = await request(app.getHttpServer())
        .post(path)
        .set('stripe-signature', 'sig_valida')
        .set('Content-Type', 'application/json')
        .send({ id: 'evt_1' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true, type: 'invoice.paid' });
    }

    expect(stripeService.handleWebhookEvent).toHaveBeenCalledTimes(2);
  });

  it('AppController ya no expone ningún handler de webhook (evita el duplicado de rutas)', () => {
    const methods = Object.getOwnPropertyNames(AppController.prototype);
    const webhookRoutes = methods.filter((m) => {
      const path = Reflect.getMetadata('path', AppController.prototype[m] ?? {});
      return typeof path === 'string' && path.includes('webhook');
    });

    expect(webhookRoutes).toEqual([]);
  });
});
