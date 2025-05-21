import { 
  Controller, 
  Headers, 
  HttpCode,
  HttpStatus, 
  Post, 
  RawBodyRequest, 
  Req, 
  Res,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StripeService } from '../services/stripe.service';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  
  constructor(private readonly stripeService: StripeService) {}
  
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({ name: 'stripe-signature', required: true, description: 'Stripe webhook signature header' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      if (!req.rawBody) {
        this.logger.error('No raw body found in request');
        return res.status(HttpStatus.BAD_REQUEST).json({
          received: false,
          error: 'No raw body found in request'
        });
      }
      
      const rawBody = req.rawBody.toString('utf8');
      
      if (!signature) {
        this.logger.error('No Stripe signature found in headers');
        return res.status(HttpStatus.BAD_REQUEST).json({
          received: false,
          error: 'No Stripe signature found in headers'
        });
      }
      
      // Verify the event first without heavy processing
      const event = await this.stripeService.verifyWebhookEvent(rawBody, signature);
      
      // Immediately respond to Stripe to acknowledge receipt
      res.status(HttpStatus.OK).json({ received: true, type: event.type });
      
      // Then process the event asynchronously
      setImmediate(() => {
        this.stripeService.processWebhookEventAsync(event)
          .catch(error => {
            this.logger.error(`Error processing webhook event asynchronously: ${error.message}`, error);
          });
      });
      
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`, error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        received: false,
        error: error.message
      });
    }
  }

  @Post('webhook-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test endpoint for Stripe webhook connectivity' })
  async testWebhook(@Res() res: Response) {
    this.logger.log('Webhook test endpoint accessed');
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Webhook test endpoint is functioning properly',
      timestamp: new Date().toISOString()
    });
  }
} 