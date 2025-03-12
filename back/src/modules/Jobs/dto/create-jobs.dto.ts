import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { YesOrNo, YesOrNotravell } from '../jobs.enum';

export class CreateJobDto {
  @ApiProperty({
    description: 'Título del trabajo relacionado con el fútbol',
    example: 'Delantero para equipo profesional',
  })
  @IsNotEmpty()
  @IsString()
  title: string;


  @ApiProperty({
    description: 'Ubicación donde se llevará a cabo el trabajo',
    example: 'Barcelona, España',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Salario ofrecido para el jugador',
    example: 1500000,
  })
  @IsNotEmpty()
  @IsNumber()
  salary: number;

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
}
