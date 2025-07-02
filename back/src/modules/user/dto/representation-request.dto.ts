import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateRepresentationRequestDto {
  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del jugador',
  })
  @IsUUID()
  playerId: string;

  @ApiProperty({
    example: 'Me gustaría representarte como agente',
    description: 'Mensaje del reclutador',
  })
  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdateRepresentationRequestDto {
  @ApiProperty({
    example: 'ACCEPTED',
    description: 'Nuevo estado de la solicitud',
  })
  @IsString()
  status: string;
} 