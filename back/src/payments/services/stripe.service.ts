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
      apiVersion: '2025-02-24.acacia' as any,
      timeout: 120000, // Increased timeout to 2 minutes
      maxNetworkRetries: 10, // Increased from 7 to 10
      httpAgent: new https.Agent({ 
        keepAlive: true,
        timeout: 120000, // Match the Stripe timeout
        // Add these to help with potential network issues
        rejectUnauthorized: true,
        keepAliveMsecs: 2000
      }),
    });
    
    this.logger.log('Stripe service initialized with enhanced connection settings');
  }

  /**
   * Wrapper function to safely execute Stripe API calls with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 5,
    initialDelay = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Only retry on connection errors
        if (!this.isConnectionError(error)) {
          this.logger.error(`Stripe ${operationName} error (not retrying): ${error.message}`, error.stack);
          throw error;
        }
        
        // Calculate backoff delay with exponential increase and some jitter
        const delay = Math.min(initialDelay * Math.pow(2, attempt - 1) + Math.random() * 1000, 15000);
        
        if (attempt < maxRetries) {
          this.logger.warn(`Stripe connection error, retrying in ${delay}ms (Attempt ${attempt}/${maxRetries}): ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          this.logger.error(`Failed after ${maxRetries} retries: ${error.message}`, error.stack);
          throw error;
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Check if the error is a connection-related error
   */
  private isConnectionError(error: any): boolean {
    return (
      error.type === 'StripeConnectionError' ||
      error.message.includes('connection') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('socket hang up') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT')
    );
  }

  /**
   * Creates a Stripe checkout session for one-time payments
   */
  async createOneTimePaymentSession(dto: CreateOneTimePaymentDto) {
    try {
      const successUrl = dto.successUrl || `${this.frontendDomain}/payment/success`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      // Using the specific product ID
      const productId = 'prod_SHJrAdSz0dxsxC';
      
      // Log the product details for debugging
      try {
        const product = await this.executeWithRetry(
          () => this.stripe.products.retrieve(productId),
          'product retrieval'
        );
        this.logger.log(`Using product for one-time payment: ${product.name} (${product.id})`);
      } catch (productError) {
        this.logger.warn(`Could not retrieve product details: ${productError.message}`);
      }
      
      const session = await this.executeWithRetry(
        () => this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          customer_email: dto.customerEmail,
          line_items: [
            {
              price_data: {
                currency: dto.currency,
                product: productId,
                unit_amount: dto.amount,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
        'one-time payment session creation'
      );

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
      this.logger.log(`Creating subscription session with priceId: ${dto.priceId}`);
      const successUrl = dto.successUrl || `${this.frontendDomain}/payment/success`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      // First try to retrieve the price to validate it exists
      let validPriceId = dto.priceId;
      
      try {
        await this.executeWithRetry(
          () => this.stripe.prices.retrieve(validPriceId),
          'price validation'
        );
        this.logger.log(`Successfully validated price ID: ${validPriceId}`);
      } catch (priceError) {
        this.logger.warn(`Invalid price ID: ${validPriceId}. Error: ${priceError.message}`);
        this.logger.warn('Attempting to use fallback price ID instead...');
        
        // Try to list all prices and use the first available one as fallback
        try {
          const prices = await this.executeWithRetry(
            () => this.stripe.prices.list({ limit: 5 }),
            'prices listing'
          );
          if (prices.data.length > 0) {
            validPriceId = prices.data[0].id;
            this.logger.log(`Using fallback price ID: ${validPriceId}`);
          } else {
            throw new Error('No prices available in Stripe account');
          }
        } catch (listError) {
          this.logger.error(`Failed to list prices: ${listError.message}`);
          throw new InternalServerErrorException(`Could not find any valid price IDs. Please check your Stripe configuration.`);
        }
      }
      
      // Get product information
      const productId = 'prod_SHJrAdSz0dxsxC'; // Using the specific product ID
      
      // Log the product details for debugging
      try {
        const product = await this.executeWithRetry(
          () => this.stripe.products.retrieve(productId),
          'product retrieval'
        );
        this.logger.log(`Using product: ${product.name} (${product.id})`);
      } catch (productError) {
        this.logger.warn(`Could not retrieve product details: ${productError.message}`);
      }
      
      this.logger.log(`Creating checkout session with price ID: ${validPriceId}`);
      const session = await this.executeWithRetry(
        () => this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          customer_email: dto.customerEmail,
          line_items: [
            {
              price: validPriceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
        'subscription session creation'
      );

      // Get price details to populate our database record
      const price = await this.executeWithRetry(
        () => this.stripe.prices.retrieve(validPriceId),
        'price retrieval'
      );
      
      // Save the payment in our database
      const payment = this.paymentRepo.create({
        stripeSessionId: session.id,
        stripePriceId: validPriceId,
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
      // Verify and construct the event - this does not need retry as it's a local operation
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
      return await this.executeWithRetry(
        () => this.stripe.checkout.sessions.retrieve(sessionId),
        'session retrieval'
      );
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
      // Find the payment in our database by payment intent ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripePaymentIntentId: paymentIntent.id } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for payment intent ID: ${paymentIntent.id}`);
        return;
      }

      // Update payment status
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = paymentIntent.last_payment_error?.message || 'Unknown failure reason';
      
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
      
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated subscription status for ${subscription.id} to ${subscription.status}`);
      
    } catch (error) {
      this.logger.error(`Error handling customer.subscription.created: ${error.message}`, error.stack);
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
      
      // Update subscription status and related details
      payment.subscriptionStatus = subscription.status;
      
      // Update payment status based on subscription status
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        payment.status = PaymentStatus.SUCCEEDED;
      } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
        payment.status = PaymentStatus.PAYMENT_REQUIRED;
      } else if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
        payment.status = PaymentStatus.CANCELED;
      }
      
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated subscription status for ${subscription.id} to ${subscription.status}`);
      
    } catch (error) {
      this.logger.error(`Error handling customer.subscription.updated: ${error.message}`, error.stack);
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
      
      // Update subscription status
      payment.subscriptionStatus = 'canceled';
      payment.status = PaymentStatus.CANCELED;
      
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment for subscription ${subscription.id} to CANCELED`);
      
    } catch (error) {
      this.logger.error(`Error handling customer.subscription.deleted: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the invoice.paid event
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    try {
      if (!invoice.subscription) {
        this.logger.warn(`Invoice ${invoice.id} is not associated with a subscription`);
        return;
      }
      
      // Find the payment in our database by subscription ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSubscriptionId: invoice.subscription as string } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for subscription ID: ${invoice.subscription}`);
        return;
      }
      
      // Update payment status
      payment.status = PaymentStatus.SUCCEEDED;
      payment.lastInvoiceId = invoice.id;
      payment.lastPaymentDate = new Date();
      
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for invoice ${invoice.id} to SUCCEEDED`);
      
    } catch (error) {
      this.logger.error(`Error handling invoice.paid: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles the invoice.payment_failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
      if (!invoice.subscription) {
        this.logger.warn(`Invoice ${invoice.id} is not associated with a subscription`);
        return;
      }
      
      // Find the payment in our database by subscription ID
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSubscriptionId: invoice.subscription as string } 
      });

      if (!payment) {
        this.logger.warn(`Payment not found for subscription ID: ${invoice.subscription}`);
        return;
      }
      
      // Update payment status
      payment.status = PaymentStatus.PAYMENT_REQUIRED;
      payment.lastInvoiceId = invoice.id;
      // Use a fallback message since last_payment_error is not available on Invoice type
      payment.failureReason = invoice.description || 'Payment failed';
      
      await this.paymentRepo.save(payment);
      this.logger.log(`Updated payment status for invoice ${invoice.id} to PAYMENT_REQUIRED`);
      
    } catch (error) {
      this.logger.error(`Error handling invoice.payment_failed: ${error.message}`, error.stack);
    }
  }
}