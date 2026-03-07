import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { Application } from '../../Applications/entities/applications.entity';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  applicationId: string;

  @Column()
  signedAt: Date;

  @Column()
  terms: string;

  @OneToOne('Application', 'contract')
  @JoinColumn({ name: 'applicationId' })
  application: Application;
}
