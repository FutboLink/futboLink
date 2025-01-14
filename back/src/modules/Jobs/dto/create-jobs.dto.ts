import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    description: 'Título del trabajo relacionado con el fútbol',
    example: 'Delantero para equipo profesional',
  })
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
  @IsString()
  offerType: string;

  @ApiProperty({
    description: 'Posición en el campo que se necesita cubrir',
    example: 'Delantero',
  })
  @IsString()
  position: string;

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
