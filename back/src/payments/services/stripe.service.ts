import { Injectable, InternalServerErrorException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType, SubscriptionPlan } from '../entities/payment.entity';
import { CreateOneTimePaymentDto, CreateSubscriptionDto } from '../dto';
import * as https from 'https';
import { UserService } from '../../modules/user/user.service';
import { User, UserPlan } from '../../modules/user/entities/user.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly frontendDomain: string;
  private readonly productId: string = 'prod_S1PExFzjXvaE7E'; // Semiprofesional product ID
  private readonly priceId: string = 'price_1R7MPlGbCHvHfqXFNjW8oj2k'; // Semiprofesional price ID
  private readonly semiproPriceId: string = 'price_1R7MPlGbCHvHfqXFNjW8oj2k'; // Asumiendo este es Semipro
  private readonly proPriceId: string = 'price_1R7MaqGbCHvHfqXFimcCzvlo'; // Asumiendo este es Pro

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
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
      const planName = this.getPlanNameFromPriceId(dto.priceId);
      this.logger.log(`Creating subscription session for plan: ${planName}, priceId: ${dto.priceId}, email: ${dto.customerEmail}`);
      
      // Asegurarse que la successUrl del DTO ya tiene los parámetros base.
      // Aquí le añadimos email y plan para que la página de éxito los reciba.
      const successUrlWithParams = `${dto.successUrl}${dto.successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(dto.customerEmail)}&plan=${encodeURIComponent(planName)}`;
      const cancelUrl = dto.cancelUrl || `${this.frontendDomain}/payment/cancel`;
      
      let subscriptionTypeForPaymentEntity: SubscriptionPlan = SubscriptionPlan.AMATEUR;
      if (planName === UserPlan.SEMIPROFESIONAL) subscriptionTypeForPaymentEntity = SubscriptionPlan.SEMIPROFESIONAL;
      else if (planName === UserPlan.PROFESIONAL) subscriptionTypeForPaymentEntity = SubscriptionPlan.PROFESIONAL;

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: dto.customerEmail,
        line_items: [{ price: dto.priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrlWithParams, 
        cancel_url: cancelUrl,
        metadata: { plan: planName }, // Guardar el nombre del plan (enum UserPlan) en metadata
      });

      const payment = this.paymentRepo.create({
        stripeSessionId: session.id,
        stripePriceId: dto.priceId,
        customerEmail: dto.customerEmail,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0, 
        currency: session.currency || 'eur',
        status: PaymentStatus.PENDING,
        type: PaymentType.SUBSCRIPTION,
        description: dto.description || 'FutboLink Subscription',
        subscriptionType: subscriptionTypeForPaymentEntity,
        subscriptionStatus: 'incomplete',
      });
      await this.paymentRepo.save(payment);
      this.logger.log(`Created subscription session: ${session.id}, paymentId: ${payment.id}`);
      return { url: session.url, sessionId: session.id, paymentId: payment.id };
    } catch (error) {
      this.logger.error(`Error creating subscription session: ${error.message}`, error.stack);
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
  async handleWebhookEvent(rawBody: string, signature: string): Promise<{ received: boolean; type?: string; error?: string }> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
        this.logger.error('Stripe webhook secret not configured');
        throw new InternalServerErrorException('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
        event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        this.logger.log(`Processing webhook event: ${event.type}`);
    } catch (err) {
        this.logger.error(`Webhook signature verification failed: ${err.message}`, err.stack);
        throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    try {
        await this.processWebhookEventType(event);
        return { received: true, type: event.type };
    } catch (processingError) {
        this.logger.error(`Error processing webhook event ${event.type}: ${processingError.message}`, processingError.stack);
        return { received: true, type: event.type, error: `Internal error processing event: ${processingError.message}` };
    }
  }

  private async processWebhookEventType(event: Stripe.Event): Promise<void> {
    switch (event.type) {
        case 'checkout.session.completed':
            await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
            break;
        case 'customer.subscription.updated':
            await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
            break;
        case 'customer.subscription.deleted':
            await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
            break;
        default:
            this.logger.log(`Unhandled webhook event type in processWebhookEventType: ${event.type}`);
    }
  }

  /**
   * Handles the checkout.session.completed event
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      this.logger.log(`Webhook: checkout.session.completed for session ${session.id}`);
      const customerEmail = session.customer_details?.email || session.customer_email;
      if (!customerEmail) {
        this.logger.error('Webhook Error: No customer email in checkout.session.completed.');
        return;
      }

      let planToUpdate: UserPlan | null = null;
      if (session.metadata?.plan) {
        planToUpdate = session.metadata.plan as UserPlan;
      } else if (session.mode === 'subscription' && session.line_items?.data[0]?.price?.id) {
        planToUpdate = this.getPlanNameFromPriceId(session.line_items.data[0].price.id);
      } else if (session.mode === 'subscription'){
         this.logger.warn(`Webhook: Could not determine plan for subscription session ${session.id}. User ${customerEmail} plan will not be changed by this webhook.`);
      }
      
      if (planToUpdate) {
        const user = await this.userService.findOneByEmail(customerEmail);
        if (user) {
           if (user.currentPlan !== planToUpdate) {
             await this.userService.updateUserPlan(customerEmail, planToUpdate);
             this.logger.log(`Webhook: User ${customerEmail} plan updated to ${planToUpdate}.`);
           } else {
             this.logger.log(`Webhook: User ${customerEmail} plan already ${planToUpdate}. No update needed.`);
           }
        } else {
            this.logger.warn(`Webhook: User ${customerEmail} not found, cannot update plan via checkout session.`);
        }
      }

      const payment = await this.paymentRepo.findOne({ where: { stripeSessionId: session.id } });
      if (payment) {
        payment.stripeCustomerId = session.customer as string;
        payment.status = PaymentStatus.SUCCEEDED;
        if (session.payment_intent) payment.stripePaymentIntentId = session.payment_intent as string;
        if (session.subscription) payment.stripeSubscriptionId = session.subscription as string;
        if (planToUpdate) payment.subscriptionType = planToUpdate as unknown as SubscriptionPlan;
        await this.paymentRepo.save(payment);
        this.logger.log(`Webhook: Payment entity for session ${session.id} updated.`);
      } else {
        this.logger.warn(`Webhook: Payment entity not found for session ${session.id}.`);
      }
    } catch (error) {
      this.logger.error(`Webhook Error (checkout.session.completed): ${error.message}`, error.stack);
    }
  }
  
  /**
   * Handles the customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      this.logger.log(`Webhook: customer.subscription.updated for sub ID ${subscription.id}`);
      const customerEmail = await this.getCustomerEmailFromSubscription(subscription);
      if (!customerEmail) return;

      let newPlan = UserPlan.AMATEUR; 
      if ((subscription.status === 'active' || subscription.status === 'trialing') && subscription.items.data.length > 0) {
        newPlan = this.getPlanNameFromPriceId(subscription.items.data[0].price.id);
      } else {
        this.logger.log(`Subscription ${subscription.id} status is ${subscription.status}. User ${customerEmail} plan will be set to AMATEUR.`);
      }
      
      const user = await this.userService.findOneByEmail(customerEmail);
      if(user && user.currentPlan !== newPlan){
        await this.userService.updateUserPlan(customerEmail, newPlan);
        this.logger.log(`Webhook: User ${customerEmail} plan updated to ${newPlan}.`);
      } else if (!user) {
        this.logger.warn(`Webhook: User ${customerEmail} not found for subscription update.`);
      }

      const payment = await this.paymentRepo.findOne({ where: { stripeSubscriptionId: subscription.id } });
      if(payment){
        payment.subscriptionStatus = subscription.status;
        payment.stripePriceId = subscription.items.data[0]?.price.id;
        if(newPlan) payment.subscriptionType = newPlan as unknown as SubscriptionPlan;
        await this.paymentRepo.save(payment);
      }

    } catch (error) {
      this.logger.error(`Webhook Error (customer.subscription.updated): ${error.message}`, error.stack);
    }
  }
  
  /**
   * Handles the customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      this.logger.log(`Webhook: customer.subscription.deleted for sub ID ${subscription.id}`);
      const customerEmail = await this.getCustomerEmailFromSubscription(subscription);
      if (!customerEmail) return;

      const user = await this.userService.findOneByEmail(customerEmail);
      if(user && user.currentPlan !== UserPlan.AMATEUR){
        await this.userService.updateUserPlan(customerEmail, UserPlan.AMATEUR);
        this.logger.log(`Webhook: User ${customerEmail} plan set to AMATEUR due to subscription deletion.`);
      } else if(!user){
        this.logger.warn(`Webhook: User ${customerEmail} not found for subscription deletion.`);
      } else {
        this.logger.log(`Webhook: User ${customerEmail} plan already AMATEUR or no change needed.`);
      }

      const payment = await this.paymentRepo.findOne({ where: { stripeSubscriptionId: subscription.id } });
      if(payment){
        payment.subscriptionStatus = 'canceled'; 
        payment.status = PaymentStatus.CANCELED;
        payment.subscriptionType = SubscriptionPlan.AMATEUR;
        await this.paymentRepo.save(payment);
      }
    } catch (error) {
      this.logger.error(`Webhook Error (customer.subscription.deleted): ${error.message}`, error.stack);
    }
  }

  /**
   * Checks if a user has an active subscription based on their email
   */
  async checkUserSubscription(userEmail: string): Promise<{ hasActiveSubscription: boolean, subscriptionType?: string }> {
    try {
      this.logger.log(`StripeService: Checking plan for user: ${userEmail}`);
      const user = await this.userService.findOneByEmail(userEmail);

      if (!user) {
        this.logger.warn(`StripeService: User ${userEmail} not found. Defaulting to Amateur.`);
        return { hasActiveSubscription: false, subscriptionType: UserPlan.AMATEUR };
      }

      const currentPlan = user.currentPlan || UserPlan.AMATEUR;
      const isActive = currentPlan !== UserPlan.AMATEUR;
      
      this.logger.log(`StripeService: User ${userEmail} plan from DB: ${currentPlan}. IsActive: ${isActive}`);
      return { hasActiveSubscription: isActive, subscriptionType: currentPlan };
    } catch (error) {
      this.logger.error(`StripeService: Error in checkUserSubscription for ${userEmail}: ${error.message}`, error.stack);
      return { hasActiveSubscription: false, subscriptionType: UserPlan.AMATEUR };
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

  /**
   * Fix any incorrect subscription type mappings for Semiprofesional subscribers
   * This should be called after the price ID mapping issue is fixed
   */
  async refreshSubscriptionTypes(): Promise<{ updated: number, message: string }> {
    try {
      // Find all payments for Semiprofesional subscription
      const semiproPayments = await this.paymentRepo.find({
        where: { 
          stripePriceId: 'price_1R7MPlGbCHvHfqXFNjW8oj2k',
          type: PaymentType.SUBSCRIPTION
        }
      });
      
      this.logger.log(`Found ${semiproPayments.length} Semiprofesional subscription payments to update`);
      
      // Update each payment to set the subscriptionType field
      for (const payment of semiproPayments) {
        payment.subscriptionType = SubscriptionPlan.SEMIPROFESIONAL;
        await this.paymentRepo.save(payment);
        
        this.logger.log(`Updated subscription type for ${payment.customerEmail} to Semiprofesional`);
      }
      
      // Find all payments for Professional subscription
      const proPayments = await this.paymentRepo.find({
        where: { 
          stripePriceId: 'price_1R7MaqGbCHvHfqXFimcCzvlo',
          type: PaymentType.SUBSCRIPTION
        }
      });
      
      this.logger.log(`Found ${proPayments.length} Professional subscription payments to update`);
      
      // Update each payment to set the subscriptionType field
      for (const payment of proPayments) {
        payment.subscriptionType = SubscriptionPlan.PROFESIONAL;
        await this.paymentRepo.save(payment);
        
        this.logger.log(`Updated subscription type for ${payment.customerEmail} to Profesional`);
      }
      
      // Find all other subscription payments that don't have a subscriptionType
      const otherPayments = await this.paymentRepo.find({
        where: { 
          type: PaymentType.SUBSCRIPTION,
          subscriptionType: null
        }
      });
      
      this.logger.log(`Found ${otherPayments.length} other subscription payments to update`);
      
      // Update each payment to set the subscriptionType field to Amateur
      for (const payment of otherPayments) {
        payment.subscriptionType = SubscriptionPlan.AMATEUR;
        await this.paymentRepo.save(payment);
        
        this.logger.log(`Updated subscription type for ${payment.customerEmail} to Amateur`);
      }
      
      return { 
        updated: semiproPayments.length + proPayments.length + otherPayments.length, 
        message: `Updated ${semiproPayments.length} Semiprofesional, ${proPayments.length} Professional, and ${otherPayments.length} Amateur subscription records` 
      };
    } catch (error) {
      this.logger.error(`Error refreshing subscription types: ${error.message}`, error);
      throw new InternalServerErrorException(`Failed to refresh subscription types: ${error.message}`);
    }
  }
  
  /**
   * Manually verify a checkout session and update subscription status
   * This is useful for clients to call when they want to force refresh subscription status
   */
  async verifySessionAndUpdateSubscription(sessionId: string, email?: string): Promise<{ success: boolean, message: string, subscriptionStatus?: string }> {
    try {
      this.logger.log(`Manually verifying session: ${sessionId}, email: ${email || 'not provided'}`);
      
      // First, retrieve the session from Stripe to get the latest status
      let session: Stripe.Checkout.Session;
      try {
        session = await this.stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['subscription', 'payment_intent']
        });
        this.logger.log(`Retrieved session from Stripe: ${sessionId}, status: ${session.status}, payment_status: ${session.payment_status}`);
      } catch (stripeError) {
        this.logger.error(`Error retrieving session from Stripe: ${stripeError.message}`);
        return { 
          success: false, 
          message: `Error retrieving session from Stripe: ${stripeError.message}` 
        };
      }
      
      // Find the payment record in our database
      const payment = await this.paymentRepo.findOne({ 
        where: { stripeSessionId: sessionId } 
      });
      
      if (!payment) {
        this.logger.warn(`Payment record not found for session ID: ${sessionId}`);
        
        // Si no encontramos el pago pero el email está disponible, buscamos por email
        if (email) {
          this.logger.log(`Attempting to find payment by email: ${email}`);
          const emailPayment = await this.paymentRepo.findOne({
            where: { 
              customerEmail: email,
              type: PaymentType.SUBSCRIPTION
            },
            order: { createdAt: 'DESC' }
          });
          
          if (emailPayment) {
            this.logger.log(`Found payment via email: ${emailPayment.id}`);
            // Actualizar el ID de sesión si no coincide
            if (emailPayment.stripeSessionId !== sessionId) {
              emailPayment.stripeSessionId = sessionId;
              await this.paymentRepo.save(emailPayment);
              this.logger.log(`Updated session ID for payment: ${emailPayment.id}`);
            }
            
            // Continuar con este pago
            return this.processSessionVerification(session, emailPayment, email);
          }
        }
        
        return { 
          success: false, 
          message: `Payment record not found for session ID: ${sessionId}` 
        };
      }
      
      return this.processSessionVerification(session, payment, email);
    } catch (error) {
      this.logger.error(`Error verifying session: ${error.message}`, error);
      return { 
        success: false, 
        message: `Error verifying session: ${error.message}` 
      };
    }
  }
  
  /**
   * Helper method to process session verification and update payment status
   * Extracted to avoid code duplication
   */
  private async processSessionVerification(
    session: Stripe.Checkout.Session, 
    payment: Payment, 
    email?: string
  ): Promise<{ success: boolean, message: string, subscriptionStatus?: string }> {
    // If email is provided and doesn't match, this might be the wrong session
    if (email && payment.customerEmail && email !== payment.customerEmail) {
      this.logger.warn(`Email mismatch: provided ${email}, found ${payment.customerEmail}`);
      // But continue anyway, just log the warning
    }
    
    // Check the session status
    const isSessionComplete = session.status === 'complete';
    const isPaymentSuccess = session.payment_status === 'paid';
    
    this.logger.log(`Session status: complete=${isSessionComplete}, payment_success=${isPaymentSuccess}`);
    
    // IMPORTANTE: Solo actualizar el estado de la suscripción si la sesión está completa y el pago es exitoso
    if (isSessionComplete && isPaymentSuccess) {
      // Update payment status to SUCCEEDED, which is critical for subscription activation
      payment.status = PaymentStatus.SUCCEEDED;
      this.logger.log(`Updated payment status to SUCCEEDED for session ${session.id}`);
      
      // If there's a subscription ID in the session, update that too
      if (session.subscription) {
        const subscriptionId = typeof session.subscription === 'string' 
          ? session.subscription 
          : session.subscription.id;
          
        payment.stripeSubscriptionId = subscriptionId;
        
        // Try to get subscription details
        try {
          const subscription = typeof session.subscription === 'object'
            ? session.subscription
            : await this.stripe.subscriptions.retrieve(subscriptionId);
            
          payment.subscriptionStatus = subscription.status;
          this.logger.log(`Subscription status: ${subscription.status}`);
          
          // Update subscription type based on price ID if needed
          if (subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            payment.stripePriceId = priceId;
            this.logger.log(`Found price ID: ${priceId}`);
            
            // Set the subscription type based on price ID if not already set
            if (!payment.subscriptionType || payment.subscriptionType === SubscriptionPlan.AMATEUR) {
              if (priceId === 'price_1R7MPlGbCHvHfqXFNjW8oj2k') {
                payment.subscriptionType = SubscriptionPlan.SEMIPROFESIONAL;
                this.logger.log(`Set subscription type to SEMIPROFESIONAL based on price ID ${priceId}`);
              } else if (priceId === 'price_1R7MaqGbCHvHfqXFimcCzvlo') {
                payment.subscriptionType = SubscriptionPlan.PROFESIONAL;
                this.logger.log(`Set subscription type to PROFESIONAL based on price ID ${priceId}`);
              }
            }
          }
        } catch (subError) {
          this.logger.error(`Error retrieving subscription details: ${subError.message}`);
          // Continue anyway, we've already updated what we can
        }
      }
      
      // Save the updated payment
      await this.paymentRepo.save(payment);
      this.logger.log(`Saved updated payment to database for session ${session.id}`);
      
      // Log current state of subscription
      this.logger.log(`Final payment status: ${payment.status}, subscription type: ${payment.subscriptionType}, subscription status: ${payment.subscriptionStatus}`);
      
      return { 
        success: true, 
        message: 'Session verified and subscription updated successfully', 
        subscriptionStatus: payment.subscriptionStatus || 'active' 
      };
    }
    
    // Session is not complete or payment not successful
    this.logger.log(`Session ${session.id} status: ${session.status}, payment status: ${session.payment_status}`);
    
    return { 
      success: false, 
      message: `Session not complete or payment not successful. Status: ${session.status}, payment status: ${session.payment_status}`,
      subscriptionStatus: payment.subscriptionStatus
    };
  }

  private async getCustomerEmailFromSubscription(subscription: Stripe.Subscription): Promise<string | null> {
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    try {
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      if (customer && !customer.deleted && customer.email) {
        return customer.email;
      }
      this.logger.warn(`Could not retrieve valid email for customer ID: ${customerId} from Stripe subscription ${subscription.id}`);
      return null;
    } catch (error) {
      this.logger.error(`Error retrieving customer ${customerId} from Stripe for subscription ${subscription.id}: ${error.message}`);
      return null;
    }
  }

  private getPlanNameFromPriceId(priceId: string): UserPlan {
    if (priceId === this.semiproPriceId) return UserPlan.SEMIPROFESIONAL;
    if (priceId === this.proPriceId) return UserPlan.PROFESIONAL;
    this.logger.warn(`PriceId ${priceId} no reconocido, usando AMATEUR por defecto.`);
    return UserPlan.AMATEUR;
  }
} 