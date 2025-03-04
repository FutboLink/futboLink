import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';

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

  @ApiProperty({ description: 'Usuario asociado a la suscripción' })
  @OneToOne(() => User, (user) => user.subscription)
  user: User;
}

