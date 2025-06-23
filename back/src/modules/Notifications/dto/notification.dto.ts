import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'Un reclutador ha visto tu perfil',
    description: 'Mensaje de la notificación',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'PROFILE_VIEW',
    description: 'Tipo de notificación',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del usuario que recibirá la notificación',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del usuario que generó la notificación (opcional)',
  })
  @IsUUID()
  @IsOptional()
  sourceUserId?: string;

  @ApiProperty({
    example: { jobId: 'abc123' },
    description: 'Datos adicionales relacionados con la notificación (opcional)',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateNotificationDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la notificación ha sido leída',
  })
  read?: boolean;
}

export class NotificationResponseDto {
  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID de la notificación',
  })
  id: string;

  @ApiProperty({
    example: 'Un reclutador ha visto tu perfil',
    description: 'Mensaje de la notificación',
  })
  message: string;

  @ApiProperty({
    example: 'PROFILE_VIEW',
    description: 'Tipo de notificación',
  })
  type: NotificationType;

  @ApiProperty({
    example: false,
    description: 'Indica si la notificación ha sido leída',
  })
  read: boolean;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del usuario que recibe la notificación',
  })
  userId: string;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del usuario que generó la notificación',
  })
  sourceUserId?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación de la notificación',
  })
  createdAt: Date;

  @ApiProperty({
    example: { jobId: 'abc123' },
    description: 'Datos adicionales relacionados con la notificación',
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    example: { name: 'Juan', lastname: 'Pérez' },
    description: 'Información del usuario que generó la notificación',
  })
  sourceUser?: {
    id: string;
    name: string;
    lastname: string;
    imgUrl?: string;
  };
} 