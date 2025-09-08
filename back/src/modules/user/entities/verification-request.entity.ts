import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum VerificationRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

@Entity('verification_requests')
export class VerificationRequest {
  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID de la solicitud de verificación',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del jugador que solicita verificación',
  })
  @Column()
  playerId: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Estado de la solicitud de verificación',
    enum: VerificationRequestStatus,
  })
  @Column({
    type: 'enum',
    enum: VerificationRequestStatus,
    default: VerificationRequestStatus.PENDING,
  })
  status: VerificationRequestStatus;

  @ApiProperty({
    example: 'Solicito la verificación de mi perfil para aumentar mi credibilidad',
    description: 'Mensaje del jugador explicando por qué solicita la verificación',
  })
  @Column({ nullable: true, type: 'text' })
  message: string;

  @ApiProperty({
    example: 'https://example.com/documents/player-certificate.pdf',
    description: 'URL del archivo adjunto como evidencia para la verificación',
  })
  @Column({ nullable: true, type: 'text' })
  attachmentUrl: string;

  @ApiProperty({
    example: 'Perfil verificado exitosamente',
    description: 'Comentarios del administrador sobre la decisión',
  })
  @Column({ nullable: true, type: 'text' })
  adminComments: string;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del administrador que procesó la solicitud',
  })
  @Column({ nullable: true })
  processedBy: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación de la solicitud',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Jugador que solicita la verificación',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: User;

  @ApiProperty({
    description: 'Administrador que procesó la solicitud (opcional)',
  })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'processedBy' })
  admin: User;
} 