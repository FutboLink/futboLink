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
  private readonly productId: string = 'prod_S1PP1zfIAIwheC'; // Updated product ID
  private readonly priceId: string = 'price_1R7MaqGbCHvHfqXFimcCzvlo'; // Updated price ID

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
      timeout: 10000, // Further reduced timeout
      maxNetworkRetries: 2, // Further reduced retries
      httpAgent: new https.Agent({ 
        keepAlive: false, // Disable keep-alive which might cause issues
        timeout: 10000,
        rejectUnauthorized: true,
      }),
    });
    
    this.logger.log('Stripe service initialized with minimal configuration');
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
      
      // Obtener el ID del producto específico si está disponible en la solicitud
      const productId = dto.productId || this.productId;
      if (dto.productId) {
        this.logger.log(`Usando producto específico: ${dto.productId}`);
      }
      
      // Intentar obtener información del precio real desde Stripe
      let realPrice = 0;
      let realCurrency = 'eur';
      
      try {
        // Intentar obtener el precio real desde Stripe
        const priceInfo = await this.stripe.prices.retrieve(dto.priceId || this.priceId);
        if (priceInfo && priceInfo.unit_amount) {
          realPrice = priceInfo.unit_amount / 100; // Convertir centavos a euros
          realCurrency = priceInfo.currency;
          this.logger.log(`Precio obtenido de Stripe: ${realPrice} ${realCurrency}`);
        } else {
          this.logger.warn(`No se pudo obtener información del precio. Usando valor por defecto.`);
        }
      } catch (priceError) {
        this.logger.warn(`Error al obtener información del precio: ${priceError.message}`);
      }
      
      // Utilizar precio real o valor por defecto si no se pudo obtener
      const finalPrice = realPrice > 0 ? realPrice : 0; // Si no pudimos obtener el precio, dejamos 0 y se actualizará después
      
      // Create very simple request with minimal data
      let createParams: Stripe.Checkout.SessionCreateParams;
      
      if (dto.priceId) {
        // Si hay un priceId, usar ese directamente
        createParams = {
          payment_method_types: ['card'],
          customer_email: dto.customerEmail,
          line_items: [
            {
              price: dto.priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription' as Stripe.Checkout.SessionCreateParams.Mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        };
      } else {
        // Si no hay priceId, crear con datos directos
        createParams = {
          payment_method_types: ['card'],
          customer_email: dto.customerEmail,
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product: productId, 
                unit_amount: 1000, // 10.00 EUR
                recurring: {
                  interval: 'month' as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring.Interval,
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription' as Stripe.Checkout.SessionCreateParams.Mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        };
      }
      
      console.log('Customer email: ', dto.customerEmail);
      this.logger.log(`Creating subscription with customer email: ${dto.customerEmail}`);
      
      this.logger.log('Sending simplified request to Stripe');
      const session = await this.stripe.checkout.sessions.create(createParams);
      this.logger.log(`Session created successfully with ID: ${session.id}`);
      
      try {
        // Try to save the payment record in our database
        const payment = this.paymentRepo.create({
          stripeSessionId: session.id,
          stripeCustomerId: null, // Will be updated when checkout completes
          stripePriceId: dto.priceId || this.priceId,
          customerEmail: dto.customerEmail,
          amountTotal: finalPrice,
          currency: realCurrency,
          status: PaymentStatus.PENDING,
          type: PaymentType.SUBSCRIPTION,
          description: dto.description || 'FutboLink Subscription',
        });

        await this.paymentRepo.save(payment);
        this.logger.log(`Created subscription session: ${session.id}`);
        
        // Return session URL and IDs
        return {
          url: session.url,
          sessionId: session.id,
          paymentId: payment.id,
        };
      } catch (dbError) {
        // If we can't save to the database, just return the session URL
        this.logger.error(`Error saving payment to database: ${dbError.message}`, dbError);
        
        return {
          url: session.url,
          sessionId: session.id,
        };
      }
    } catch (error) {
      this.logger.error(`Error creating subscription session: ${error.message}`, error);
      
      // Provide more detailed error information
      if (error.type === 'StripeConnectionError') {
        this.logger.error('This is a network connectivity issue with Stripe');
      }
      
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

  /**
   * Checks if a user has an active subscription based on their email
   */
  async checkUserSubscription(userEmail: string): Promise<{ hasActiveSubscription: boolean, subscriptionType?: string }> {
    try {
      this.logger.log(`Checking subscription status for user: ${userEmail}`);
      
      // Find the most recent payment for this user's subscription
      const payment = await this.paymentRepo.findOne({
        where: {
          customerEmail: userEmail,
          type: PaymentType.SUBSCRIPTION,
        },
        order: {
          updatedAt: 'DESC' // Get the most recent one
        }
      });
      
      if (!payment) {
        this.logger.log(`No subscription found for user: ${userEmail}`);
        return { hasActiveSubscription: false, subscriptionType: 'Amateur' };
      }
      
      this.logger.log(`Found payment record for ${userEmail}: status=${payment.status}, subscriptionStatus=${payment.subscriptionStatus}, priceId=${payment.stripePriceId}`);
      
      // Check if subscription is active - include more subscription statuses
      let isActive = payment.status === PaymentStatus.SUCCEEDED || 
                      (payment.subscriptionStatus === 'active' || 
                       payment.subscriptionStatus === 'trialing' ||
                       payment.subscriptionStatus === 'incomplete' ||
                       payment.subscriptionStatus === 'past_due');
      
      // Determine subscription type based on price ID
      let subscriptionType = 'Amateur';
      
      if (payment.stripePriceId) {
        // Map price IDs to subscription types
        if (payment.stripePriceId === 'price_1R7MaqGbCHvHfqXFimcCzvlo') {
          subscriptionType = 'Semiprofesional';
          isActive = true; // If we have a valid price ID for a paid plan, consider it active
        } else if (payment.stripePriceId === 'price_1RP80ZGbCHvHfqXF9CqoLtnt') {
          subscriptionType = 'Profesional';
          isActive = true; // If we have a valid price ID for a paid plan, consider it active
        }
        
        this.logger.log(`Mapped price ID ${payment.stripePriceId} to subscription type: ${subscriptionType}`);
      }
      
      // Always return the subscription type if there's a payment record, even if not active
      const result = { 
        hasActiveSubscription: isActive,
        subscriptionType: isActive || payment.status !== PaymentStatus.CANCELED ? subscriptionType : 'Amateur'
      };
      
      this.logger.log(`Subscription for ${userEmail} is ${isActive ? 'active' : 'inactive'} (${result.subscriptionType})`);
      return result;
    } catch (error) {
      this.logger.error(`Error checking subscription for ${userEmail}: ${error.message}`, error);
      return { hasActiveSubscription: false, subscriptionType: 'Amateur' }; // Fail closed - if there's an error, assume no subscription
    }
  }
  
  /**
   * Cancels a user's subscription
   * @param userEmail The email of the user whose subscription to cancel
   * @returns Object with success status and message
   */
  async cancelSubscription(userEmail: string): Promise<{ success: boolean, message: string }> {
    try {
      this.logger.log(`Attempting to cancel subscription for user: ${userEmail}`);
      
      // Find the payment record with the subscription ID
      const payment = await this.paymentRepo.findOne({
        where: {
          customerEmail: userEmail,
          type: PaymentType.SUBSCRIPTION,
        },
        order: {
          updatedAt: 'DESC' // Get the most recent one
        }
      });
      
      if (!payment) {
        this.logger.log(`No subscription found for user: ${userEmail}`);
        return { success: false, message: 'No se encontró ninguna suscripción activa para este usuario.' };
      }
      
      if (!payment.stripeSubscriptionId) {
        this.logger.log(`Payment record found but no subscription ID for user: ${userEmail}`);
        return { success: false, message: 'No se encontró un ID de suscripción válido.' };
      }
      
      // Cancel the subscription in Stripe
      const subscription = await this.stripe.subscriptions.cancel(payment.stripeSubscriptionId);
      
      // Update the payment record
      payment.subscriptionStatus = subscription.status;
      payment.status = PaymentStatus.CANCELED;
      await this.paymentRepo.save(payment);
      
      this.logger.log(`Successfully canceled subscription for user: ${userEmail}`);
      return { 
        success: true, 
        message: 'Suscripción cancelada exitosamente. Tu acceso permanecerá activo hasta el final del período de facturación.' 
      };
      
    } catch (error) {
      this.logger.error(`Error canceling subscription for ${userEmail}: ${error.message}`, error);
      
      // Check for specific Stripe errors
      if (error.type === 'StripeInvalidRequestError') {
        return { success: false, message: 'No se pudo cancelar la suscripción: ID de suscripción inválido o ya cancelada.' };
      }
      
      return { success: false, message: `Error al cancelar la suscripción: ${error.message}` };
    }
  }
} 