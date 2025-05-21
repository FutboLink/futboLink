import { Controller, Get, Post, Req, Res, Headers, HttpCode, HttpStatus, Logger, Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { StripeService } from './payments/services/stripe.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly stripeService: StripeService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Stripe webhook handler with async processing pattern
  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request, 
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Received Stripe webhook event');
      
      // Get the raw body
      const rawBody = (req as any).rawBody?.toString('utf8');
      
      if (!rawBody) {
        this.logger.error('No raw body found in request');
        return res.status(HttpStatus.BAD_REQUEST).json({ 
          received: false, 
          error: 'No raw body in request'
        });
      }
      
      if (!signature) {
        this.logger.error('No stripe-signature header present');
        return res.status(HttpStatus.BAD_REQUEST).json({ 
          received: false, 
          error: 'Missing stripe-signature header'
        });
      }
      
      // First, immediately respond to Stripe to acknowledge receipt
      res.status(HttpStatus.OK).json({ received: true });
      
      // Then process the webhook asynchronously
      this.processWebhookAsync(rawBody, signature);
      
    } catch (error) {
      this.logger.error(`Error in webhook handler: ${error.message}`, error.stack);
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        received: false, 
        error: error.message
      });
    }
  }
  
  // Process webhook asynchronously
  private async processWebhookAsync(rawBody: string, signature: string): Promise<void> {
    try {
      await this.stripeService.handleWebhookEvent(rawBody, signature);
      this.logger.log('Successfully processed webhook event asynchronously');
    } catch (error) {
      this.logger.error(`Error processing webhook asynchronously: ${error.message}`, error.stack);
    }
  }
}
