import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RecruiterApplicationDto {
  @ApiProperty({
    description: 'ID del jugador que será postulado (debe estar en la cartera del reclutador)',
    example: '3e43e86b-37f3-49b8-94bf-7d70f5eff66c',
  })
  @IsNotEmpty()
  @IsString()
  playerId: string;

  @ApiProperty({
    description: 'ID de la oferta de trabajo a la que se postulará al jugador',
    example: '5a7b9c3d-1e2f-4g5h-6i7j-8k9l0m1n2o3p',
  })
  @IsNotEmpty()
  @IsString()
  jobId: string;

  @ApiProperty({
    description: 'Mensaje del reclutador explicando por qué postula al jugador',
    example: 'Este jugador tiene las habilidades perfectas para esta posición. Ha demostrado excelente rendimiento en partidos recientes.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Mensaje adicional del jugador (opcional)',
    example: 'Estoy muy interesado en esta oportunidad y creo que mi estilo de juego encaja perfectamente con el equipo.',
    required: false,
  })
  @IsOptional()
  @IsString()
  playerMessage?: string;
} 