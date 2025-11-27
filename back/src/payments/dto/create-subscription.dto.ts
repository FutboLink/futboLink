import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentBaseDto } from './payment-base.dto';

export class CreateSubscriptionDto extends PaymentBaseDto {
  @ApiProperty({ 
    description: 'Stripe Price ID for the subscription', 
    example: 'price_1RP80ZGbCHvHfqXF9CqoLtnt' 
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;
  
  @ApiProperty({ 
    description: 'Stripe Product ID for the subscription', 
    example: 'prod_SJlX3qKmAGTGw6',
    required: false
  })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ 
    description: 'Optional Stripe coupon/promotion code to apply discount', 
    example: 'SUMMER2024',
    required: false
  })
  @IsString()
  @IsOptional()
  couponCode?: string;
} 