import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';

export enum NotificationType {
  PROFILE_VIEW = 'PROFILE_VIEW',
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  JOB_UPDATED = 'JOB_UPDATED',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID de la notificación',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Un reclutador ha visto tu perfil',
    description: 'Mensaje de la notificación',
  })
  @Column()
  message: string;

  @ApiProperty({
    example: 'PROFILE_VIEW',
    description: 'Tipo de notificación',
    enum: NotificationType,
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.PROFILE_VIEW,
  })
  type: NotificationType;

  @ApiProperty({
    example: false,
    description: 'Indica si la notificación ha sido leída',
  })
  @Column({ default: false })
  read: boolean;

  @ApiProperty({
    description: 'Usuario que recibe la notificación',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ApiProperty({
    description: 'Usuario que generó la notificación (opcional)',
  })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sourceUserId' })
  sourceUser: User;

  @Column({ nullable: true })
  sourceUserId: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación de la notificación',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: { jobId: 'abc123' },
    description: 'Datos adicionales relacionados con la notificación (opcional)',
  })
  @Column('json', { nullable: true })
  metadata: Record<string, any>;
} 