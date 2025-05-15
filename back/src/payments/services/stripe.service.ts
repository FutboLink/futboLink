import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { CreateOneTimePaymentDto, CreateSubscriptionDto } from '../dto';
import * as https from 'https';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly frontendDomain: string;
  private readonly productId: string = 'prod_SJXfFO3DbuBj0X'; // Test product ID
  private readonly priceId: string = 'price_1ROua1Gggu4c99M7WhGJjz0m'; // Test price ID

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
      apiVersion: '2023-10-16' as any,
      timeout: 30000, // Reduced timeout to 30 seconds
      maxNetworkRetries: 3, // Reduced retries to prevent long waiting times
      httpAgent: new https.Agent({ 
        keepAlive: true,
        timeout: 30000, // Match the Stripe timeout
        rejectUnauthorized: true,
      }),
    });
    
    this.logger.log('Stripe service initialized');
  }

  /**
   * Creates a Stripe checkout session for one-time payments
   */
  async createOneTimePaymentSession(dto: CreateOneTimePaymentDto) {
    try {
      const successUrl = dto.successUrl || `${this.frontendDomain}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      // Using the provided test product ID
      this.logger.log(`Creating one-time payment session with product: ${this.productId}`);
      
      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: dto.customerEmail,
        line_items: [
          {
            price_data: {
              currency: dto.currency,
              product: this.productId,
              unit_amount: dto.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          description: dto.description || 'One-time payment',
          productName: dto.productName,
        },
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

      // Return session URL and IDs
      return {
        url: session.url,
        sessionId: session.id,
        paymentId: payment.id,
      };
    } catch (error) {
      this.logger.error(`Error creating one-time payment session: ${error.message}`, error);
      throw new InternalServerErrorException(`Failed to create payment session: ${error.message}`);
    }
  }

  /**
   * Creates a Stripe checkout session for subscription payments
   */
  async createSubscriptionSession(dto: CreateSubscriptionDto) {
    try {
      this.logger.log(`Creating subscription session with priceId: ${dto.priceId}`);
      const successUrl = dto.successUrl || `${this.frontendDomain}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      // Default to the test priceId if not provided
      const priceId = dto.priceId || this.priceId;
      let session;
      
      try {
        // Try to create session using price ID
        session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          customer_email: dto.customerEmail,
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
      } catch (priceError) {
        // If using price ID fails, try with price_data as fallback
        this.logger.warn(`Failed to create session with price ID: ${priceError.message}`);
        this.logger.log('Attempting to create subscription with direct price data');
        
        // Create session with direct price data
        session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          customer_email: dto.customerEmail,
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product: this.productId,
                unit_amount: 1000, // 10.00 EUR
                recurring: {
                  interval: 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      }
      
      // Save the payment record in our database
      const payment = this.paymentRepo.create({
        stripeSessionId: session.id,
        stripeCustomerId: null, // Will be updated when checkout completes
        stripePriceId: priceId,
        customerEmail: dto.customerEmail,
        amountTotal: 0, // Will be updated when checkout completes
        currency: 'eur', // Default currency, will be updated when checkout completes
        status: PaymentStatus.PENDING,
        type: PaymentType.SUBSCRIPTION,
        description: dto.description,
      });

      await this.paymentRepo.save(payment);
      this.logger.log(`Created subscription session: ${session.id}`);
      
      // Return session URL and IDs
      return {
        url: session.url,
        sessionId: session.id,
        paymentId: payment.id,
      };
    } catch (error) {
      this.logger.error(`Error creating subscription session: ${error.message}`, error);
      throw new InternalServerErrorException(`Failed to create subscription session: ${error.message}`);
    }
  }
  
  /**
   * Retrieves a payment by ID
   */
  async getPaymentById(id: string) {
    try {
      const payment = await this.paymentRepo.findOne({ where: { id } });
      
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error retrieving payment: ${error.message}`, error);
      throw new InternalServerErrorException(`Failed to retrieve payment: ${error.message}`);
    }
  }
  
  /**
   * Retrieves a payment by Stripe session ID
   */
  async getPaymentBySessionId(sessionId: string) {
    try {
      const payment = await this.paymentRepo.findOne({ where: { stripeSessionId: sessionId } });
      
      if (!payment) {
        throw new NotFoundException(`Payment with session ID ${sessionId} not found`);
      }
      
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error retrieving payment by session ID: ${error.message}`, error);
      throw new InternalServerErrorException(`Failed to retrieve payment by session ID: ${error.message}`);
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
          
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true, type: event.type };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`, error);
      throw new InternalServerErrorException(`Webhook error: ${error.message}`);
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
      
      // Get the amount from the session if possible
      if (session.amount_total) {
        payment.amountTotal = session.amount_total / 100; // Convert from cents
        payment.currency = session.currency || payment.currency;
      }

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for session ${session.id} to SUCCEEDED`);
      
    } catch (error) {
      this.logger.error(`Error handling checkout.session.completed: ${error.message}`, error);
    }
  }
  
  /**
   * Handles the payment_intent.succeeded event
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      // Find the payment in our database by payment intent ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripePaymentIntentId: paymentIntent.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for payment intent ID: ${paymentIntent.id}`);
        return;
      }

      // Update payment status
      payment.status = PaymentStatus.SUCCEEDED;
      
      // Update amount if it was not set before
      if (payment.amountTotal === 0 && paymentIntent.amount) {
        payment.amountTotal = paymentIntent.amount / 100;
        payment.currency = paymentIntent.currency;
      }
      
      // Set last payment date
      payment.lastPaymentDate = new Date();

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for payment intent ${paymentIntent.id} to SUCCEEDED`);
      
    } catch (error) {
      this.logger.error(`Error handling payment_intent.succeeded: ${error.message}`, error);
    }
  }
  
  /**
   * Handles the payment_intent.payment_failed event
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      // Find the payment in our database by payment intent ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripePaymentIntentId: paymentIntent.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for payment intent ID: ${paymentIntent.id}`);
        return;
      }

      // Update payment status and failure reason
      payment.status = PaymentStatus.FAILED;
      
      // Get the last charge error message if available
      if (paymentIntent.last_payment_error) {
        payment.failureReason = paymentIntent.last_payment_error.message;
      } else {
        payment.failureReason = 'Payment failed';
      }

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for payment intent ${paymentIntent.id} to FAILED`);
      
    } catch (error) {
      this.logger.error(`Error handling payment_intent.payment_failed: ${error.message}`, error);
    }
  }
  
  /**
   * Handles the customer.subscription.created event
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      // Find the payment in our database by subscription ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSubscriptionId: subscription.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for subscription ID: ${subscription.id}`);
        return;
      }

      // Update subscription status
      payment.subscriptionStatus = subscription.status;
      
      // Get the first item's price ID if available
      if (subscription.items.data.length > 0) {
        payment.stripePriceId = subscription.items.data[0].price.id;
      }

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated subscription status for subscription ${subscription.id} to ${subscription.status}`);
      
    } catch (error) {
      this.logger.error(`Error handling customer.subscription.created: ${error.message}`, error);
    }
  }
  
  /**
   * Handles the customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      // Find the payment in our database by subscription ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSubscriptionId: subscription.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for subscription ID: ${subscription.id}`);
        return;
      }

      // Update subscription status
      payment.subscriptionStatus = subscription.status;
      
      // Update price ID if it has changed
      if (subscription.items.data.length > 0) {
        payment.stripePriceId = subscription.items.data[0].price.id;
      }
      
      // Update status based on subscription status
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        payment.status = PaymentStatus.SUCCEEDED;
      } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
        payment.status = PaymentStatus.PAYMENT_REQUIRED;
      } else if (subscription.status === 'canceled') {
        payment.status = PaymentStatus.CANCELED;
      }

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated subscription status for subscription ${subscription.id} to ${subscription.status}`);
      
    } catch (error) {
      this.logger.error(`Error handling customer.subscription.updated: ${error.message}`, error);
    }
  }
  
  /**
   * Handles the customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      // Find the payment in our database by subscription ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSubscriptionId: subscription.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for subscription ID: ${subscription.id}`);
        return;
      }

      // Update subscription status and payment status
      payment.subscriptionStatus = subscription.status;
      payment.status = PaymentStatus.CANCELED;

      await this.paymentRepo.save(payment);
      this.logger.log(`Updated subscription status for subscription ${subscription.id} to CANCELED`);
      
    } catch (error) {
      this.logger.error(`Error handling customer.subscription.deleted: ${error.message}`, error);
    }
  }
  
  /**
   * Handles the invoice.paid event
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    try {
      // If there's a subscription, find the payment by subscription ID
      if (invoice.subscription) {
        const payment = await this.paymentRepo.findOne({ 
          where: { stripeSubscriptionId: invoice.subscription as string } 
        });
  
        if (!payment) {
          this.logger.warn(`Payment not found for subscription ID: ${invoice.subscription}`);
          return;
        }
  
        // Update payment details
        payment.status = PaymentStatus.SUCCEEDED;
        payment.lastInvoiceId = invoice.id;
        payment.lastPaymentDate = new Date();
        
        // Update amount from invoice
        if (invoice.amount_paid) {
          payment.amountTotal = invoice.amount_paid / 100;
          payment.currency = invoice.currency;
        }
  
        await this.paymentRepo.save(payment);
        this.logger.log(`Updated payment for invoice ${invoice.id} to SUCCEEDED`);
      }
    } catch (error) {
      this.logger.error(`Error handling invoice.paid: ${error.message}`, error);
    }
  }
  
  /**
   * Handles the invoice.payment_failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
      // If there's a subscription, find the payment by subscription ID
      if (invoice.subscription) {
        const payment = await this.paymentRepo.findOne({ 
          where: { stripeSubscriptionId: invoice.subscription as string } 
        });
  
        if (!payment) {
          this.logger.warn(`Payment not found for subscription ID: ${invoice.subscription}`);
          return;
        }
  
        // Update payment details
        payment.status = PaymentStatus.PAYMENT_REQUIRED;
        payment.lastInvoiceId = invoice.id;
        
        // Save the payment failure reason if available
        if ('last_payment_error' in invoice) {
          payment.failureReason = (invoice as any).last_payment_error?.message;
        } else {
          payment.failureReason = 'Payment failed for invoice';
        }
  
        await this.paymentRepo.save(payment);
        this.logger.log(`Updated payment for invoice ${invoice.id} to PAYMENT_REQUIRED`);
      }
    } catch (error) {
      this.logger.error(`Error handling invoice.payment_failed: ${error.message}`, error);
    }
  }
} 