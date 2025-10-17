import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateVerificationSessionDto } from './dto/create-verification-session.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private userRepository: Repository<User>;

  constructor(
    userRepository: Repository<User>,
  ) {
    this.userRepository = userRepository;
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
              currency: 'usd',
              product_data: {
                name: `Verificación de Perfil - ${planName}`,
                description: `Suscripción para verificación de perfil en FutboLink`,
              },
              unit_amount: amount,
              recurring: {
                interval: 'month',
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
        // Update user subscription in database
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          await this.updateUserSubscription(userId, planId);
        }

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

  private async updateUserSubscription(userId: string, planId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Map plan ID to subscription type
      const subscriptionType = this.mapPlanIdToSubscriptionType(planId);
      
      // Update user subscription
      await this.userRepository.update(userId, {
        subscriptionType,
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      console.log(`Suscripción actualizada para usuario ${userId}: ${subscriptionType}`);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  private mapPlanIdToSubscriptionType(planId: string): string {
    const planMapping = {
      'basic': 'Semiprofesional',
      'premium': 'Profesional',
    };
    
    return planMapping[planId] || 'Amateur';
  }
}
