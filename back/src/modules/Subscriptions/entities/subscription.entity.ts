import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../../user/entities/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tipo de suscripción' })
  @Column()
  type: string;

  @ApiProperty({ description: 'Fecha de inicio de la suscripción' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ description: 'Fecha de finalización de la suscripción' })
  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @OneToOne('User', 'subscription')
  user: User;
}
