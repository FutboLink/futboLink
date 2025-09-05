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

  @ApiProperty({
    description: 'URL del archivo adjunto como evidencia para la verificación',
    example: 'https://example.com/documents/player-certificate.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
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

  @ApiProperty({
    description: 'Tipo de verificación a otorgar cuando se aprueba',
    enum: ['PROFESSIONAL', 'SEMIPROFESSIONAL', 'AMATEUR'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PROFESSIONAL', 'SEMIPROFESSIONAL', 'AMATEUR'] as const)
  verificationType?: 'PROFESSIONAL' | 'SEMIPROFESSIONAL' | 'AMATEUR';
} 