import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentBaseDto {
  @ApiProperty({ 
    description: 'Email of the customer', 
    example: 'usuario@example.com' 
  })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;
  
  @ApiProperty({ 
    description: 'Success URL to redirect after successful payment', 
    example: 'https://yoursite.com/payment/success' 
  })
  @IsString()
  @IsOptional()
  successUrl?: string;
  
  @ApiProperty({ 
    description: 'Cancel URL to redirect if payment is cancelled', 
    example: 'https://yoursite.com/payment/cancel' 
  })
  @IsString()
  @IsOptional()
  cancelUrl?: string;
  
  @ApiProperty({ 
    description: 'Payment description', 
    example: 'Subscription payment for FutboLink' 
  })
  @IsString()
  @IsOptional()
  description?: string;
} 