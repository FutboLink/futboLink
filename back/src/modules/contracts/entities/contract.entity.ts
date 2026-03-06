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

  @OneToOne(() => {
    const { Application } = require('../Applications/entities/applications.entity');
    return Application;
  }, (application: any) => application.contract)
  @JoinColumn({ name: 'applicationId' })
  application: any;
}
