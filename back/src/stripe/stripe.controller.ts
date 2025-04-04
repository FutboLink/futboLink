// payment.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';


@Controller('payment')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    const { priceId } = dto;
    const { sessionUrl } =
      await this.stripeService.createCheckoutSession(priceId);
    return { sessionUrl };

  }
}
