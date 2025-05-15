import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { CreateOneTimePaymentDto, CreateSubscriptionDto } from '../dto';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Define interface for fallback config
interface StripeFallbackConfig {
  prices: {
    semiprofessional: {
      monthly: string;
      yearly: string;
    };
    professional: {
      monthly: string;
      yearly: string;
    };
  };
  products: {
    main: string;
  };
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly frontendDomain: string;
  private readonly isProduction: boolean;
  private fallbackConfig: StripeFallbackConfig | null = null;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.frontendDomain = this.configService.get<string>('FRONTEND_DOMAIN') || 'http://localhost:3000';
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    if (!secretKey) {
      this.logger.error('Stripe secret key not configured');
      throw new InternalServerErrorException('Stripe secret key not configured');
    }

    // Try to load fallback configuration
    this.loadFallbackConfig();

    // Create custom HTTPS agent with optimized settings for production
    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 3000,
      maxSockets: 25,
      maxFreeSockets: 10,
      timeout: 60000,
    });
    
    // Increase timeout and retries for production environment
    const timeout = this.isProduction ? 120000 : 60000; // 2 minutes in production
    const maxRetries = this.isProduction ? 10 : 7;
    
    this.logger.log(`Initializing Stripe service in ${this.isProduction ? 'PRODUCTION' : 'development'} mode`);
    this.logger.log(`Using timeout: ${timeout}ms, maxRetries: ${maxRetries}`);
    
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      timeout: timeout,
      maxNetworkRetries: maxRetries,
      httpAgent: httpsAgent,
    });
    
    this.logger.log('Stripe service initialized with enhanced connection settings');
  }

  /**
   * Loads the fallback configuration from file if available
   */
  private loadFallbackConfig() {
    try {
      // Try to load from module-relative path first
      const configPath = path.resolve(__dirname, '../config/stripe-fallback.json');
      
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        this.fallbackConfig = JSON.parse(configData) as StripeFallbackConfig;
        this.logger.log('Loaded Stripe fallback configuration from config directory');
      } else {
        // Try root path as fallback
        const rootConfigPath = path.resolve(process.cwd(), 'stripe-fallback.json');
        
        if (fs.existsSync(rootConfigPath)) {
          const configData = fs.readFileSync(rootConfigPath, 'utf8');
          this.fallbackConfig = JSON.parse(configData) as StripeFallbackConfig;
          this.logger.log('Loaded Stripe fallback configuration from root directory');
        } else {
          this.logger.warn('No fallback configuration found - fallback prices will not be available');
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to load fallback config: ${error.message}`);
    }
  }

  /**
   * Creates a Stripe checkout session for one-time payments
   */
  async createOneTimePaymentSession(dto: CreateOneTimePaymentDto) {
    try {
      const successUrl = dto.successUrl || `${this.frontendDomain}/payment/success`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      // Using the specific product ID from config or hardcoded fallback
      const productId = this.fallbackConfig?.products?.main || 'prod_SHJrAdSz0dxsxC';
      
      // Log the product details for debugging
      try {
        const product = await this.stripe.products.retrieve(productId);
        this.logger.log(`Using product for one-time payment: ${product.name} (${product.id})`);
      } catch (productError) {
        this.logger.warn(`Could not retrieve product details: ${productError.message}`);
      }
      
      // Add exponential backoff retry logic for Stripe API calls
      const session = await this.retryStripeOperation(() => this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: dto.customerEmail,
        line_items: [
          {
            price_data: {
              currency: dto.currency,
              product: productId, // Use the specific product ID
              unit_amount: dto.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      }));

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
        // Use the retry mechanism for price retrieval
        await this.retryStripeOperation(() => this.stripe.prices.retrieve(validPriceId));
        this.logger.log(`Successfully validated price ID: ${validPriceId}`);
      } catch (priceError) {
        this.logger.warn(`Invalid price ID: ${validPriceId}. Error: ${priceError.message}`);
        this.logger.warn('Attempting to use fallback price ID instead...');
        
        // Try to list all prices and use the first available one as fallback
        try {
          // Use the retry mechanism for listing prices
          const prices = await this.retryStripeOperation(() => this.stripe.prices.list({ limit: 5 }));
          if (prices.data.length > 0) {
            validPriceId = prices.data[0].id;
            this.logger.log(`Using fallback price ID: ${validPriceId}`);
          } else {
            throw new Error('No prices available in Stripe account');
          }
        } catch (listError) {
          this.logger.error(`Failed to list prices: ${listError.message}`);
          
          // Try using the fallback config if available
          if (this.fallbackConfig && this.isProduction) {
            // Try to determine which tier and billing period from the original price ID
            const isProfessional = dto.priceId.includes('sVRv9wq0') || dto.priceId.includes('oRU6jXzy');
            const isYearly = dto.priceId.includes('oRU6jXzy') || dto.priceId.includes('ezWEeM3F');
            
            if (isProfessional) {
              validPriceId = isYearly 
                ? this.fallbackConfig.prices.professional.yearly 
                : this.fallbackConfig.prices.professional.monthly;
            } else {
              validPriceId = isYearly 
                ? this.fallbackConfig.prices.semiprofessional.yearly 
                : this.fallbackConfig.prices.semiprofessional.monthly;
            }
            
            this.logger.log(`Using fallback config price ID: ${validPriceId}`);
          } else if (this.isProduction) {
            const fallbackPriceIds = [
              'price_1ROuhFGggu4c99M7oOnftD8O',
              'price_1ROuhFGggu4c99M7ezWEeM3F',
              'price_1ROuhFGggu4c99M7sVRv9wq0',
              'price_1ROuhGGggu4c99M7oRU6jXzy'
            ];
            
            this.logger.log('Trying hardcoded fallback price IDs as last resort...');
            
            // Try each fallback price ID
            for (const fallbackId of fallbackPriceIds) {
              try {
                await this.retryStripeOperation(() => this.stripe.prices.retrieve(fallbackId), 3);
                validPriceId = fallbackId;
                this.logger.log(`Using hardcoded fallback price ID: ${validPriceId}`);
                break;
              } catch (e) {
                // Continue to the next fallback ID
                this.logger.warn(`Fallback price ID ${fallbackId} failed: ${e.message}`);
              }
            }
            
            // If we've tried all fallbacks and none worked, throw error
            if (validPriceId === dto.priceId) {
              throw new InternalServerErrorException(`Could not find any valid price IDs. Please check your Stripe configuration.`);
            }
          } else {
            throw new InternalServerErrorException(`Could not find any valid price IDs. Please check your Stripe configuration.`);
          }
        }
      }
      
      // Get product information
      const productId = this.fallbackConfig?.products?.main || 'prod_SHJrAdSz0dxsxC';
      
      // Log the product details for debugging
      try {
        const product = await this.retryStripeOperation(() => this.stripe.products.retrieve(productId), 2);
        this.logger.log(`Using product: ${product.name} (${product.id})`);
      } catch (productError) {
        this.logger.warn(`Could not retrieve product details: ${productError.message}`);
      }
      
      this.logger.log(`Creating checkout session with price ID: ${validPriceId}`);
      const session = await this.retryStripeOperation(() => this.stripe.checkout.sessions.create({
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
      }));

      // Get price details to populate our database record
      let price;
      try {
        price = await this.retryStripeOperation(() => this.stripe.prices.retrieve(validPriceId), 2);
      } catch (priceError) {
        // If we can't retrieve the price details, use default values
        this.logger.warn(`Could not retrieve price details: ${priceError.message}`);
        price = {
          unit_amount: validPriceId.includes('professional') ? 795 : 395,
          currency: 'eur'
        };
      }
      
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
   * Helper method to retry Stripe operations with exponential backoff
   */
  private async retryStripeOperation<T>(operation: () => Promise<T>, maxRetries = 5): Promise<T> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // If this is a Stripe connection error, retry with exponential backoff
        if (error.type === 'StripeConnectionError') {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 15000); // Max 15 seconds delay
          this.logger.warn(`Stripe connection error, retrying in ${delay}ms (Attempt ${attempt}/${maxRetries}): ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // For other errors, don't retry
          throw error;
        }
      }
    }
    
    // If we've exhausted all retries
    this.logger.error(`Failed after ${maxRetries} retries: ${lastError.message}`);
    throw lastError;
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