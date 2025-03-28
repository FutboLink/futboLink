import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('YOUR_STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new InternalServerErrorException(
        'Stripe secret key not configured',
      );
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(priceId: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url:
          'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3001/Subs',
      });

      return { sessionUrl: session.url };
    } catch (error) {
      throw error;
    }
  }
}
