<<<<<<< HEAD
import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { YesOrNo, YesOrNotravell } from '../jobs.enum';
=======
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { YesOrNo } from '../entities/jobs.entity';

>>>>>>> develop

export class CreateJobDto {
  @ApiProperty({ description: 'Título del trabajo', example: 'Entrenador de fútbol' })
  @IsNotEmpty()
  @IsString()
  title: string;

<<<<<<< HEAD

  @ApiProperty({
    description: 'Ubicación donde se llevará a cabo el trabajo',
    example: 'Barcelona, España',
  })
=======
  @ApiProperty({ description: 'Ubicación del trabajo', example: 'Madrid, España' })
>>>>>>> develop
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

<<<<<<< HEAD
  @ApiProperty({
    description:
      'Tipo de oferta (e.g., contrato temporal, contrato permanente)',
    example: 'Contrato permanente',
  })
  @IsNotEmpty()
  @IsString()
  contractDurations: string;

  @ApiProperty({
    description: 'Posición en el campo que se necesita cubrir',
    example: 'Delantero',
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    description: 'Competencias requeridas para el puesto',
    example: ['Sueldo fijo', 'Bonos por rendimiento', 'Viáticos incluidos', 'Alojamiento incluido', 'No remunerado', 'A convenir', 'Equipamiento deportivo']
  })
  @IsArray()
  extra: string[];

  @ApiProperty({
    description: 'Países donde aplica la oferta',
    example: 'España',
  })
  @IsNotEmpty()
  @IsString()
  nationality: string;

  @ApiProperty({
    description: 'URL de la imagen representativa de la oferta (opcional)',
    example: 'https://example.com/player-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imgUrl: string;

  @ApiProperty({
    description:
      'Tipo de trabajo (e.g., profesional, semiprofesional, juvenil)',
    example: 'Profesional',
  })
  @IsNotEmpty()
  @IsString()
  contractTypes: string;

  @ApiProperty({
    description: 'Categoría del trabajo',
    example: 'Profesional',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Género del deporte',
    example: 'Masculino',
  })
  @IsNotEmpty()
  @IsString()
  sportGenres: string;

  @ApiProperty({
    description: 'Edad mínima del trabajador',
    example: 18,
  })
  @IsNotEmpty()
  @IsNumber()
  minAge: number;

  @ApiProperty({
    description: 'Edad máxima del trabajador',
    example: 35,
  })
  @IsNotEmpty()
  @IsNumber()
  maxAge: number;



  @ApiProperty({
    description: 'Deporte relacionado con el trabajo',
    example: 'Fútbol 11',
  })
  @IsNotEmpty()
  @IsString()
  sport: string;

  @ApiProperty({
    description: 'Experiencia mínima necesaria para el trabajo',
    example: 'Semiprofesional',
  })
  @IsNotEmpty()
  @IsString()
  minExperience: string;

  @ApiProperty({
    description: 'Disponibilidad para viajar',
    example: 'yes',
  })
  @IsNotEmpty()
  @IsEnum(YesOrNo)
  availabilityToTravel: YesOrNotravell;

  @ApiProperty({
    description: '¿Requiere pasaporte de la UE?',
    example: 'no',
  })
  @IsNotEmpty()
  @IsEnum(YesOrNo)
  euPassport: YesOrNo;

  @ApiProperty({
    description: 'Gmail del usuario (opcional)',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  gmail?: string;
=======
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
>>>>>>> develop
}
