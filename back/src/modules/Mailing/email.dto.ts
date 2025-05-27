import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user requesting password reset',
    required: true
  })
  @IsEmail({}, { message: 'Por favor, ingrese un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'random-token-123456',
    description: 'Password reset token',
    required: true
  })
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @ApiProperty({
    example: 'newSecurePassword123',
    description: 'New password',
    required: true,
    minLength: 6
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}

export class ContactFormDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the person sending the message',
    required: true
  })
  @IsEmail({}, { message: 'Por favor, ingrese un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Name of the person sending the message',
    required: true,
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Me gustaría obtener más información sobre sus servicios.',
    description: 'Message content',
    required: true,
    minLength: 10,
    maxLength: 1000
  })
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'El mensaje no puede tener más de 1000 caracteres' })
  mensaje: string;
}