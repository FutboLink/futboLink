import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateVerificationSessionDto } from './dto/create-verification-session.simple.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    // Initialize Stripe with your secret key
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createVerificationCheckoutSession(createSessionDto: CreateVerificationSessionDto) {
    try {
      const { planId, priceId, userEmail, userId, planName, amount } = createSessionDto;

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Verificación de Perfil - ${planName}`,
                description: `Suscripción para verificación de perfil en FutboLink`,
              },
              unit_amount: amount,
              recurring: {
                interval: planId === 'premium' ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/user-viewer/${userId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/user-viewer/${userId}?payment=cancelled`,
        customer_email: userEmail,
        metadata: {
          userId,
          planId,
          planName,
        },
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
        message: 'Sesión de pago creada exitosamente',
      };
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      throw new BadRequestException('Error al crear la sesión de pago');
    }
  }

  async verifyPaymentSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        return {
          success: true,
          message: 'Pago verificado exitosamente',
          session: {
            id: session.id,
            status: session.payment_status,
            amount: session.amount_total,
          },
        };
      }

      return {
        success: false,
        message: 'Pago no completado',
        session: {
          id: session.id,
          status: session.payment_status,
        },
      };
    } catch (error) {
      console.error('Error verifying payment session:', error);
      throw new BadRequestException('Error al verificar el pago');
    }
  }
}
