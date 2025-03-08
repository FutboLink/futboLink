import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment')
  async createPayment(@Body() createPaymentDto: { amount: number; currency: string }) {
    const { amount, currency } = createPaymentDto;
    const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency);
    return { clientSecret: paymentIntent.client_secret }; 
  }
}
