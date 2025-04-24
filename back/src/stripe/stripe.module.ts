import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.env.production.local' }),TypeOrmModule.forFeature([Payment])],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
