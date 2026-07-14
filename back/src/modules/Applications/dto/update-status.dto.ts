import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../entities/applications.entity';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la aplicación',
    enum: ApplicationStatus,
    example: ApplicationStatus.SHORTLISTED,
  })
  @IsEnum(ApplicationStatus, {
    message: 'El estado enviado no es un estado de aplicación válido',
  })
  status: ApplicationStatus;
}
