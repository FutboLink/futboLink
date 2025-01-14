import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsString,
  IsDate,
  IsNumber,
  IsArray,
} from 'class-validator';
import { UserType } from '../roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    description: 'Nombre de la agencia (opcional)',
    example: 'Agencia de Talentos',
    required: false,
  })
  @IsOptional()
  @IsString()
  nameAgency?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'password123',
  })
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserType,
    example: UserType.PLAYER,
  })
  @IsEnum(UserType)
  role?: UserType;

  @ApiProperty({
    description: 'URL de la imagen del usuario (opcional)',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  imgUrl?: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario (opcional)',
    example: '+123456789',
    required: false,
  })
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Nacionalidad del usuario (opcional)',
    example: 'Argentina',
    required: false,
  })
  @IsString()
  nationality?: string;

  @ApiProperty({
    description: 'Ubicación del usuario (opcional)',
    example: 'Buenos Aires',
    required: false,
  })
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Género del usuario (opcional)',
    example: 'Masculino',
    required: false,
  })
  @IsString()
  genre?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del usuario (opcional)',
    example: '1990-01-01',
    required: false,
  })
  @IsDate()
  birthday?: Date;

  @ApiProperty({
    description: 'Altura del usuario en centímetros (opcional)',
    example: 180,
    required: false,
  })
  @IsNumber()
  height?: number;

  @ApiProperty({
    description: 'Peso del usuario en kilogramos (opcional)',
    example: 75,
    required: false,
  })
  @IsNumber()
  weight?: number;

  @ApiProperty({
    description: 'Pie hábil del usuario (opcional)',
    example: 'Derecho',
    required: false,
  })
  @IsString()
  skillfulFoot?: string;

  @ApiProperty({
    description: 'Estructura corporal del usuario (opcional)',
    example: 'Atlética',
    required: false,
  })
  @IsString()
  bodyStructure?: string;

  @ApiProperty({
    description: 'Habilidades del usuario (opcional)',
    example: ['Tiro Libre', 'Velocidad'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  habilities?: string[];
}
