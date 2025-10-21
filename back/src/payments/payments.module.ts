import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { StripeService } from './services/stripe.service';
import { PaymentsController } from './controllers/payments.controller';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment]),
    UserModule,
  ],
  controllers: [PaymentsController],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {} 