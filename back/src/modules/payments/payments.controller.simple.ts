import { PaymentsService } from './payments.service.simple';
import { CreateVerificationSessionDto } from './dto/create-verification-session.simple.dto';

export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  async createVerificationSession(createSessionDto: CreateVerificationSessionDto) {
    return this.paymentsService.createVerificationCheckoutSession(createSessionDto);
  }

  async verifySession(sessionId: string) {
    return this.paymentsService.verifyPaymentSession(sessionId);
  }
}
