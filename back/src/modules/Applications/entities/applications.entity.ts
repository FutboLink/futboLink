import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from '../../user/entities/user.entity';
import type { Contract } from '../../contracts/entities/contract.entity';
import type { Job } from '../../Jobs/entities/jobs.entity';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Application {
  @ApiProperty({ example: 1, description: 'ID de las postulaciones' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Usuario que aplica' })
  @ManyToOne('User', 'applications', { onDelete: 'CASCADE' })
  player: User;

  @ApiProperty({
    example: 'Estoy interesado en esta posición.',
    description: 'Mensaje del aplicante',
  })
  @Column('text')
  message: string;

  @ApiProperty({
    enum: ApplicationStatus,
    enumName: 'ApplicationStatus',
    type: String,
    example: 'PENDING',
    description: 'Estado de la aplicación',
  })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: string;

  @ApiProperty({
    example: '2024-12-01T12:34:56Z',
    description: 'Fecha de aplicación',
  })
  @CreateDateColumn()
  appliedAt: Date;

  @ApiProperty({
    example: '2024-12-05T10:00:00Z',
    description: 'Fecha de selección para evaluación',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  shortlistedAt: Date;

  @ApiProperty({
    example: false,
    description: 'Indica si la aplicación fue creada por un reclutador',
    default: false,
  })
  @Column({ default: false })
  appliedByRecruiter: boolean;

  @ApiProperty({
    description: 'Reclutador que aplicó en nombre del jugador (si appliedByRecruiter es true)',
    nullable: true,
  })
  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'recruiterId' })
  recruiter: User;

  @ApiProperty({
    example: 'El jugador tiene las habilidades perfectas para esta posición.',
    description: 'Mensaje del reclutador (si appliedByRecruiter es true)',
    nullable: true,
  })
  @Column('text', { nullable: true })
  recruiterMessage: string;

  @OneToOne('Contract', 'application')
  @JoinColumn({ name: 'Contracts' })
  contract: Contract;

  @ManyToOne('Job', 'applications')
  job: Job;
}
