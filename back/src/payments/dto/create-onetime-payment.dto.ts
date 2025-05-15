import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { PaymentBaseDto } from './payment-base.dto';

export class CreateOneTimePaymentDto extends PaymentBaseDto {
  @ApiProperty({ 
    description: 'Amount to charge in cents (e.g., 1000 for $10.00)', 
    example: 1000 
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ 
    description: 'Currency code in ISO format', 
    example: 'eur',
    default: 'eur'
  })
  @IsString()
  @IsNotEmpty()
  currency: string = 'eur';
  
  @ApiProperty({ 
    description: 'Product name', 
    example: 'Premium Access' 
  })
  @IsString()
  @IsNotEmpty()
  productName: string;
} 