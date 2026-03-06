import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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

  @OneToOne(() => {
    const { User } = require('../../user/entities/user.entity');
    return User;
  }, (user: any) => user.subscription)
  user: any;
}

