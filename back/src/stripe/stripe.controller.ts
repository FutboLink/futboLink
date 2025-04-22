import { Controller, Post, Headers, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Payment')
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
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      amount: { type: 'number', example: 1000 },
      currency: { type: 'string', example: 'usd' }
    }}})
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
  @ApiHeader({ name: 'stripe-signature', required: true })
  async handleWebhook(
    @Req() req: any,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const result = await this.stripeService.handleWebhook(req, signature);
    res.status(result.status).send(result.message);
  }

  @Post('subscribe')
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      email: { type: 'string', example: 'user@example.com' },
      priceId: { type: 'string', example: 'price_12345' }
    }
  }})
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
