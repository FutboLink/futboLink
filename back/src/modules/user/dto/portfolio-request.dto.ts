import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PortfolioRequestDto {
  @ApiProperty({
    description: 'ID del jugador que se quiere añadir a la cartera',
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
  })
  @IsUUID()
  @IsNotEmpty()
  playerId: string;

  @ApiProperty({
    description: 'Mensaje opcional para el jugador',
    example: 'Me gustaría añadirte a mi cartera de jugadores para seguir tu carrera',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
} 