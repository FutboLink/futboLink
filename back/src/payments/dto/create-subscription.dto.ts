import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentBaseDto } from './payment-base.dto';

export class CreateSubscriptionDto extends PaymentBaseDto {
  @ApiProperty({ 
    description: 'Stripe Price ID for the subscription', 
    example: 'price_1R7MPlGbCHvHfqXFNjW8oj2k' 
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;
} 