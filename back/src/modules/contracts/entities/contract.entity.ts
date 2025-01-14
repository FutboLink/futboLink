import { Application } from 'src/modules/Applications/entities/applications.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

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

  @OneToOne(() => Application, (application) => application.contract)
  @JoinColumn({ name: 'applicationId' })
  application: Application;
}
