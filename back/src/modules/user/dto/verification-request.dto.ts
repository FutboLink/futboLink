import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationRequestStatus } from '../entities/verification-request.entity';

export class CreateVerificationRequestDto {
  @ApiProperty({
    description: 'Mensaje del jugador explicando por qué solicita la verificación',
    example: 'Solicito la verificación de mi perfil para aumentar mi credibilidad con los reclutadores',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateVerificationRequestDto {
  @ApiProperty({
    description: 'Estado de la solicitud de verificación',
    enum: VerificationRequestStatus,
    example: VerificationRequestStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(VerificationRequestStatus)
  status: VerificationRequestStatus;

  @ApiProperty({
    description: 'Comentarios del administrador sobre la decisión',
    example: 'Perfil verificado exitosamente. El jugador cumple con todos los requisitos.',
    required: false,
  })
  @IsOptional()
  @IsString()
  adminComments?: string;
} 