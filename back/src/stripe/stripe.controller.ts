import { Controller, Post, Headers, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';


@Controller('payment')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

/*   @Post('create-checkout-session')
  async createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    const { priceId } = dto;
    const { sessionUrl } =
      await this.stripeService.createCheckoutSession(priceId);
    return { sessionUrl };

  } */

  @Post('checkout')
  async createCheckout(@Body() body: { amount: number; currency: string }) {
    const session = await this.stripeService.createCheckoutSession(
      body.amount,
      body.currency,
      'http://localhost:3000/success', // URL al pagar correctamente
      'http://localhost:3000/cancel',  // URL al cancelar
    );
    return { url: session.url };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const result = await this.stripeService.handleWebhook(req, signature);
    res.status(result.status).send(result.message);
  }

  @Post('subscribe')
async subscribe(@Body() body: { email: string; priceId: string }) {
  const session = await this.stripeService.createSubscriptionSession(
    body.email,
    body.priceId,
    'http://localhost:3000/success',
    'http://localhost:3000/cancel',
  );
  return { url: session.url };
}

}
