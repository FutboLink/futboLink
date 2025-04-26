import { ApiProperty } from '@nestjs/swagger';
import {  IsEmail, IsString, MaxLength, MinLength } from 'class-validator';


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

export class ContactFormDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico del usuario que está enviando el mensaje',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario que está enviando el mensaje',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Tengo una pregunta sobre los paquetes turísticos.',
    description: 'Mensaje enviado por el usuario',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  mensaje: string;
}