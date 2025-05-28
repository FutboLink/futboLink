import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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