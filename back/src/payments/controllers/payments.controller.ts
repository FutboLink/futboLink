import { 
  Body, 
  Controller, 
  Get, 
  Headers, 
  HttpCode,
  HttpStatus, 
  Param, 
  Post, 
  RawBodyRequest, 
  Req, 
  Res,
  Query,
  BadRequestException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StripeService } from '../services/stripe.service';
import { CreateOneTimePaymentDto, CreateSubscriptionDto } from '../dto';
import { Logger } from '@nestjs/common';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly stripeService: StripeService) {}
  
  @Post('onetime')
  @ApiOperation({ summary: 'Create a one-time payment checkout session' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The checkout session has been successfully created',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to redirect the user to' },
        sessionId: { type: 'string', description: 'The Stripe session ID' },
        paymentId: { type: 'string', description: 'The internal payment record ID' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error creating payment session' })
  async createOneTimePayment(@Body() createOneTimePaymentDto: CreateOneTimePaymentDto) {
    return this.stripeService.createOneTimePaymentSession(createOneTimePaymentDto);
  }
  
  @Post('subscription')
  @ApiOperation({ summary: 'Create a subscription payment checkout session' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The subscription checkout session has been successfully created',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to redirect the user to' },
        sessionId: { type: 'string', description: 'The Stripe session ID' },
        paymentId: { type: 'string', description: 'The internal payment record ID' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error creating subscription session' })
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.stripeService.createSubscriptionSession(createSubscriptionDto);
  }
  
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({ name: 'stripe-signature', required: true, description: 'Stripe webhook signature header' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid webhook signature' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error processing webhook' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      const rawBody = req.rawBody.toString('utf8');
      const result = await this.stripeService.handleWebhookEvent(rawBody, signature);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get payment details by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error retrieving payment' })
  async getPayment(@Param('id') id: string) {
    return this.stripeService.getPaymentById(id);
  }
  
  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get payment details by Stripe session ID' })
  @ApiParam({ name: 'sessionId', description: 'Stripe session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error retrieving payment' })
  async getPaymentBySessionId(@Param('sessionId') sessionId: string) {
    return this.stripeService.getPaymentBySessionId(sessionId);
  }
  
  @Get('subscription/check')
  @ApiOperation({ summary: 'Check if a user has an active subscription' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Subscription status check result',
    schema: {
      type: 'object',
      properties: {
        hasActiveSubscription: { type: 'boolean', description: 'Whether the user has an active subscription' },
        subscriptionType: { type: 'string', description: 'Type of subscription (based on price ID)' }
      }
    }
  })
  async checkSubscription(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    const subscriptionInfo = await this.stripeService.checkUserSubscription(email);
    return subscriptionInfo;
  }
  
  @Post('subscription/cancel')
  @ApiOperation({ summary: 'Cancel a user subscription' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Subscription cancellation result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether the cancellation was successful' },
        message: { type: 'string', description: 'Message describing the result' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error canceling subscription' })
  async cancelSubscription(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    return this.stripeService.cancelSubscription(email);
  }

  @Post('subscription/refresh-types')
  @ApiOperation({ summary: 'Refresh subscription types after fixing price ID mapping issue' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Subscription type refresh result',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', description: 'Number of records updated' },
        message: { type: 'string', description: 'Message describing the result' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error refreshing subscription types' })
  async refreshSubscriptionTypes() {
    return this.stripeService.refreshSubscriptionTypes();
  }
  
  @Post('verify-session')
  @ApiOperation({ summary: 'Manually verify a checkout session and update subscription status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Session verification result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether the verification was successful' },
        message: { type: 'string', description: 'Message describing the result' },
        subscriptionStatus: { type: 'string', description: 'Current subscription status' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error verifying session' })
  async verifySession(@Body() verifySessionDto: { sessionId: string, email: string }) {
    if (!verifySessionDto.sessionId) {
      throw new BadRequestException('Session ID is required');
    }
    
    this.logger.log(`Manual verification requested for session: ${verifySessionDto.sessionId}, email: ${verifySessionDto.email || 'not provided'}`);
    
    return this.stripeService.verifySessionAndUpdateSubscription(
      verifySessionDto.sessionId,
      verifySessionDto.email
    );
  }
} 