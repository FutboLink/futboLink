import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.simple';
import { CreateVerificationSessionDto } from './dto/create-verification-session.simple.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-verification-session')
  @ApiOperation({ summary: 'Create Stripe checkout session for verification subscription' })
  @ApiResponse({ status: 200, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createVerificationSession(@Body() createSessionDto: CreateVerificationSessionDto) {
    return this.paymentsService.createVerificationCheckoutSession(createSessionDto);
  }

  @Get('verify-session/:sessionId')
  @ApiOperation({ summary: 'Verify payment session status' })
  @ApiResponse({ status: 200, description: 'Session verified successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async verifySession(@Param('sessionId') sessionId: string) {
    return this.paymentsService.verifyPaymentSession(sessionId);
  }
}
