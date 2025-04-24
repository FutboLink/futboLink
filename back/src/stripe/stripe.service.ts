import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly configService: ConfigService) {  
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

  async createSubscriptionSession(customerEmail: string, priceId: string, successUrl: string, cancelUrl: string) {
    return await this.stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCheckoutSession(amount: number, currency: string, successUrl: string, cancelUrl: string) {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Producto de ejemplo',
            },
            unit_amount: amount, // en centavos: $10.00 => 1000
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

    async handleWebhook(req: Request, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const rawBody = (req as any).rawBody;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err) {
      console.log('⚠️ Webhook error:', err.message);
      return { status: 400, message: `Webhook Error: ${err.message}` };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = this.paymentRepo.create({
        stripeSessionId: session.id,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
      });

      await this.paymentRepo.save(payment);
      console.log('💾 Pago guardado en base de datos');
    }

    return { status: 200, message: 'Webhook recibido' };
  }
}
