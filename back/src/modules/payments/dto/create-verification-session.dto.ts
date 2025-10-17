import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateVerificationSessionDto {
  @ApiProperty({ description: 'Plan ID selected by user' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ description: 'Stripe price ID for the plan' })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({ description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Plan name' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({ description: 'Amount in cents' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
