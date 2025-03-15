import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { YesOrNo, YesOrNotravell } from '../jobs.enum';

export class CreateJobDto {
  @ApiProperty({ description: 'Título del trabajo', example: 'Entrenador de fútbol' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descripción del trabajo o posición',
    example:
      'Se busca delantero con experiencia en ligas nacionales o internacionales.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Ubicación donde se llevará a cabo el trabajo',
    example: 'Barcelona, España',
  })
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

  @ApiProperty({
    description:
      'Tipo de oferta (e.g., contrato temporal, contrato permanente)',
    example: 'Contrato permanente',
  })
  @IsString()
  offerType: string;

  @ApiProperty({
    description: 'Posición en el campo que se necesita cubrir',
    example: 'Delantero',
  })
  @IsString()
  minExperience: string;

  @ApiProperty({
    description: 'Competencias requeridas para el puesto',
    example: ['Velocidad', 'Técnica de disparo', 'Trabajo en equipo'],
  })
  @IsArray()
  competencies: string[];

  @ApiProperty({
    description: 'Países donde aplica la oferta',
    example: ['España', 'Italia', 'Francia'],
  })
  @IsArray()
  countries: string[];

  @ApiProperty({
    description: 'URL de la imagen representativa de la oferta (opcional)',
    example: 'https://example.com/player-image.jpg',
    required: false,
  })
  @IsString()
  imgUrl: string;

  @ApiProperty({
    description:
      'Tipo de trabajo (e.g., profesional, semiprofesional, juvenil)',
    example: 'Profesional',
  })
  @IsString()
  type: string;
}
