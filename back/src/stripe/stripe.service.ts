import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: '.env.development' });

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.YOUR_STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia', 
    });
  }

  
  async createPaymentIntent(amount: number, currency: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: currency,
    });
    return paymentIntent;
  }
}
