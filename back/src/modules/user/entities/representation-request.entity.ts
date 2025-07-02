import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum RepresentationRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

@Entity('representation_requests')
export class RepresentationRequest {
  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID de la solicitud',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del reclutador',
  })
  @Column()
  recruiterId: string;

  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del jugador',
  })
  @Column()
  playerId: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Estado de la solicitud',
    enum: RepresentationRequestStatus,
  })
  @Column({
    type: 'enum',
    enum: RepresentationRequestStatus,
    default: RepresentationRequestStatus.PENDING,
  })
  status: RepresentationRequestStatus;

  @ApiProperty({
    example: 'Me gustaría representarte como agente',
    description: 'Mensaje del reclutador',
  })
  @Column({ nullable: true, type: 'text' })
  message: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de creación',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Reclutador que envía la solicitud',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recruiterId' })
  recruiter: User;

  @ApiProperty({
    description: 'Jugador que recibe la solicitud',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: User;
} 