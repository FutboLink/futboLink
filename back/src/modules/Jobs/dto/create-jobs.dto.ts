import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { YesOrNo } from '../entities/jobs.entity';


export class CreateJobDto {
  @ApiProperty({ description: 'Título del trabajo', example: 'Entrenador de fútbol' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Ubicación del trabajo', example: 'Madrid, España' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'Posición del trabajo', example: 'Delantero' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({ description: 'Categoría del deporte', example: 'Fútbol profesional' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: 'Tipo de deporte', example: 'Fútbol' })
  @IsNotEmpty()
  @IsString()
  sport: string;

  @ApiProperty({ description: 'Tipo de contrato', example: 'Tiempo completo' })
  @IsNotEmpty()
  @IsString()
  contractTypes: string;

  @ApiProperty({ description: 'Duración del contrato', example: '1 año' })
  @IsNotEmpty()
  @IsString()
  contractDurations: string;

  @ApiProperty({ description: 'Salario ofrecido', example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @ApiProperty({ description: 'Beneficios adicionales', example: ['Alojamiento', 'Comida'] })
  @IsArray()
  @IsString({ each: true })
  extra: string[];

  @ApiProperty({ description: 'Opciones de transporte', example: ['Vehículo proporcionado', 'Reembolso de transporte'] })
  @IsArray()
  @IsString({ each: true })
  transport: string[];

  @ApiProperty({ description: 'Edad mínima requerida', example: '18' })
  @IsNotEmpty()
  @IsString()
  minAge: string;

  @ApiProperty({ description: 'Edad máxima permitida', example: '35' })
  @IsNotEmpty()
  @IsString()
  maxAge: string;

  @ApiProperty({ description: 'Género deportivo', example: 'Masculino' })
  @IsNotEmpty()
  @IsString()
  sportGenres: string;

  @ApiProperty({ description: 'Experiencia mínima requerida', example: '2 años' })
  @IsNotEmpty()
  @IsString()
  minExperience: string;

  @ApiProperty({ description: 'Disponibilidad para viajar', enum: YesOrNo, example: YesOrNo.YES })
  @IsNotEmpty()
  @IsEnum(YesOrNo)
  availabilityToTravel: YesOrNo;

  @ApiProperty({ description: 'Pasaporte de la UE requerido', enum: YesOrNo, example: YesOrNo.NO })
  @IsNotEmpty()
  @IsEnum(YesOrNo)
  euPassport: YesOrNo;

  @ApiProperty({ description: 'Correo electrónico de contacto', required: false, example: 'contacto@gmail.com' })
  @IsOptional()
  @IsEmail()
  gmail?: string;

  @ApiProperty({ description: 'URL de la imagen', example: 'https://example.com/image.jpg' })
  @IsNotEmpty()
  @IsString()
  imgUrl: string;
}
