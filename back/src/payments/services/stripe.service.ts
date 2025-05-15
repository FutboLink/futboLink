import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { CreateOneTimePaymentDto, CreateSubscriptionDto } from '../dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly frontendDomain: string;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.frontendDomain = this.configService.get<string>('FRONTEND_DOMAIN') || 'http://localhost:3000';
    
    if (!secretKey) {
      this.logger.error('Stripe secret key not configured');
      throw new InternalServerErrorException('Stripe secret key not configured');
    }
    
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  /**
   * Creates a Stripe checkout session for one-time payments
   */
  async createOneTimePaymentSession(dto: CreateOneTimePaymentDto) {
    try {
      const successUrl = dto.successUrl || `${this.frontendDomain}/payment/success`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: dto.customerEmail,
        line_items: [
          {
            price_data: {
              currency: dto.currency,
              product_data: {
                name: dto.productName,
                description: dto.description || 'One-time payment',
              },
              unit_amount: dto.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Save the payment in our database
      const payment = this.paymentRepo.create({
        stripeSessionId: session.id,
        customerEmail: dto.customerEmail,
        amountTotal: dto.amount / 100, // Convert cents to main currency unit for database
        currency: dto.currency,
        status: PaymentStatus.PENDING,
        type: PaymentType.ONE_TIME,
        description: dto.description,
      });

      await this.paymentRepo.save(payment);
      this.logger.log(`Created one-time payment session: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
        paymentId: payment.id,
      };
    } catch (error) {
      this.logger.error(`Error creating one-time payment session: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error creating payment session: ${error.message}`);
    }
  }

  /**
   * Creates a Stripe checkout session for subscription payments
   */
  async createSubscriptionSession(dto: CreateSubscriptionDto) {
    try {
      const successUrl = dto.successUrl || `${this.frontendDomain}/payment/success`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: dto.customerEmail,
        line_items: [
          {
            price: dto.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Get price details to populate our database record
      const price = await this.stripe.prices.retrieve(dto.priceId);
      
      // Save the payment in our database
      const payment = this.paymentRepo.create({
        stripeSessionId: session.id,
        stripePriceId: dto.priceId,
        customerEmail: dto.customerEmail,
        amountTotal: price.unit_amount / 100, // Convert cents to main currency unit
        currency: price.currency,
        status: PaymentStatus.PENDING,
        type: PaymentType.SUBSCRIPTION,
        description: dto.description || 'Subscription payment',
      });

      await this.paymentRepo.save(payment);
      this.logger.log(`Created subscription session: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
        paymentId: payment.id,
      };
    } catch (error) {
      this.logger.error(`Error creating subscription session: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error creating subscription session: ${error.message}`);
    }
  }

  /**
   * Handles Stripe webhook events
   */
  async handleWebhookEvent(rawBody: string, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.error('Stripe webhook secret not configured');
      throw new InternalServerErrorException('Stripe webhook secret not configured');
    }

    try {
      // Verify and construct the event
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      
      this.logger.log(`Processing webhook event: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
          
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
          
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
      }

      return { success: true, eventType: event.type };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Webhook error: ${error.message}`);
    }
  }

  /**
   * Retrieves payment details by ID
   */
  async getPaymentById(id: string) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  /**
   * Retrieves payment details by Stripe session ID
   */
  async getPaymentBySessionId(sessionId: string) {
    const payment = await this.paymentRepo.findOne({ where: { stripeSessionId: sessionId } });
    if (!payment) {
      throw new NotFoundException(`Payment with session ID ${sessionId} not found`);
    }
    return payment;
  }

  /**
   * Get Stripe session details
   */
  async getSessionDetails(sessionId: string) {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      this.logger.error(`Error retrieving session ${sessionId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error retrieving session: ${error.message}`);
    }
  }

  /**
   * Handles the checkout.session.completed event
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      // Find the payment in our database
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSessionId: session.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for session ID: ${session.id}`);
        return;
      }

      // Update payment with Stripe customer ID and status
      payment.stripeCustomerId = session.customer as string;
      payment.status = PaymentStatus.SUCCEEDED;
      
      if (session.payment_intent) {
        payment.stripePaymentIntentId = session.payment_intent as string;
      }
      
      if (session.subscription) {
        payment.stripeSubscriptionId = session.subscription as string;
      }

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for session ${session.id} to SUCCEEDED`);
      
    } catch (error) {
      this.logger.error(`Error handling checkout.session.completed: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the payment_intent.succeeded event
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const payment = await this.paymentRepo.findOne({ 
        where: { stripePaymentIntentId: paymentIntent.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for payment intent ID: ${paymentIntent.id}`);
        return;
      }

      payment.status = PaymentStatus.SUCCEEDED;
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for payment intent ${paymentIntent.id} to SUCCEEDED`);
      
    } catch (error) {
      this.logger.error(`Error handling payment_intent.succeeded: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the payment_intent.payment_failed event
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      const payment = await this.paymentRepo.findOne({ 
        where: { stripePaymentIntentId: paymentIntent.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for payment intent ID: ${paymentIntent.id}`);
        return;
      }

      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for payment intent ${paymentIntent.id} to FAILED`);
      
    } catch (error) {
      this.logger.error(`Error handling payment_intent.payment_failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the customer.subscription.created event
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      // We may need to link this with an existing payment or create a new record
      // depending on your business logic
      this.logger.log(`Subscription created: ${subscription.id}`);
    } catch (error) {
      this.logger.error(`Error handling subscription.created: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSubscriptionId: subscription.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for subscription ID: ${subscription.id}`);
        return;
      }

      // Update the payment status based on the subscription status
      if (subscription.status === 'active') {
        payment.status = PaymentStatus.SUCCEEDED;
      } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        payment.status = PaymentStatus.CANCELED;
      }

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment for subscription ${subscription.id} to ${payment.status}`);
      
    } catch (error) {
      this.logger.error(`Error handling subscription.updated: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSubscriptionId: subscription.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for subscription ID: ${subscription.id}`);
        return;
      }

      payment.status = PaymentStatus.CANCELED;
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment for subscription ${subscription.id} to CANCELED`);
      
    } catch (error) {
      this.logger.error(`Error handling subscription.deleted: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the invoice.paid event
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    try {
      if (invoice.subscription) {
        const payment = await this.paymentRepo.findOne({ 
          where: { stripeSubscriptionId: invoice.subscription as string } 
        });

        if (payment) {
          payment.status = PaymentStatus.SUCCEEDED;
          await this.paymentRepo.save(payment);
          this.logger.log(`Updated payment for subscription ${invoice.subscription} to SUCCEEDED due to paid invoice`);
        }
      }
    } catch (error) {
      this.logger.error(`Error handling invoice.paid: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the invoice.payment_failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
      if (invoice.subscription) {
        const payment = await this.paymentRepo.findOne({ 
          where: { stripeSubscriptionId: invoice.subscription as string } 
        });

        if (payment) {
          payment.status = PaymentStatus.FAILED;
          await this.paymentRepo.save(payment);
          this.logger.log(`Updated payment for subscription ${invoice.subscription} to FAILED due to failed invoice payment`);
        }
      }
    } catch (error) {
      this.logger.error(`Error handling invoice.payment_failed: ${error.message}`, error.stack);
    }
  }
} 