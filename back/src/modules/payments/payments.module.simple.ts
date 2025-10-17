import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller.simple';
import { PaymentsService } from './payments.service.simple';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
