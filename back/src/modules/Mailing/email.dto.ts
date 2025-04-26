import { ApiProperty } from '@nestjs/swagger';
import {  IsEmail, IsString, MinLength } from 'class-validator';


export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'random-token-123456',
    description: 'Token de recuperación de contraseña',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'newSecurePassword123',
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
