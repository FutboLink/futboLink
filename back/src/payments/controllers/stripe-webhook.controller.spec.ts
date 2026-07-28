import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeService } from '../services/stripe.service';

function makeResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

async function buildController() {
  const stripeService = { handleWebhookEvent: jest.fn() };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [StripeWebhookController],
    providers: [{ provide: StripeService, useValue: stripeService }],
  }).compile();

  return {
    controller: module.get<StripeWebhookController>(StripeWebhookController),
    stripeService,
  };
}

describe('StripeWebhookController — entrega del rawBody a Stripe', () => {
  it('pasa el rawBody como string y la firma al service, y responde 200', async () => {
    const { controller, stripeService } = await buildController();
    stripeService.handleWebhookEvent.mockResolvedValue({ received: true });
    const res = makeResponse();

    await controller.handleWebhook(
      { rawBody: Buffer.from('{"id":"evt_1"}') } as any,
      'sig_valida',
      res,
    );

    expect(stripeService.handleWebhookEvent).toHaveBeenCalledWith('{"id":"evt_1"}', 'sig_valida');
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('responde 400 con un mensaje EXPLÍCITO de configuración cuando falta rawBody (bug: hoy tira un TypeError críptico)', async () => {
    const { controller, stripeService } = await buildController();
    const res = makeResponse();

    await controller.handleWebhook({} as any, 'sig', res);

    expect(stripeService.handleWebhookEvent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('rawBody') }),
    );
  });

  it('responde 400 con el mensaje del error cuando la firma es inválida', async () => {
    const { controller, stripeService } = await buildController();
    stripeService.handleWebhookEvent.mockRejectedValue(new Error('Invalid signature'));
    const res = makeResponse();

    await controller.handleWebhook({ rawBody: Buffer.from('{}') } as any, 'sig_mala', res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid signature' }),
    );
  });

  it('queda montado en /payments/webhook Y en /stripe/webhook (no sabemos cuál URL tiene cargada el dashboard de Stripe)', () => {
    const paths = Reflect.getMetadata('path', StripeWebhookController);
    expect(paths).toEqual(expect.arrayContaining(['payments', 'stripe']));
    expect(Reflect.getMetadata('path', StripeWebhookController.prototype.handleWebhook)).toBe(
      'webhook',
    );
  });
});
