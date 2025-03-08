import { Application } from 'src/modules/Applications/entities/applications.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


export enum YesOrNo {
  YES = 'YES',
  NO = 'NO',
}

@Entity('jobs')
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column()
  position: string;

  @Column()
  category: string;

  @Column()
  sport: string;

  @Column()
  contractTypes: string;

  @Column()
  contractDurations: string;

  @Column('decimal')
  salary: number;

  @Column('simple-array')
  extra: string[];

  @Column('simple-array')
  transport: string[];

  @Column()
  minAge: string;

  @Column()
  maxAge: string;

  @Column()
  sportGenres: string;

  @Column()
  minExperience: string;

  @Column({ type: 'enum', enum: YesOrNo })
  availabilityToTravel: YesOrNo;

  @Column({ type: 'enum', enum: YesOrNo })
  euPassport: YesOrNo;

  @Column({ nullable: true })
  gmail?: string;

  @Column()
  imgUrl: string;

  @OneToMany(() => Application, (application) => application.job, { cascade: true })
  applications: Application[];
}
