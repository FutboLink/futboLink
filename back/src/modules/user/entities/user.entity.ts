import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserType } from '../roles.enum';
import { Job } from 'src/modules/Jobs/entities/jobs.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: UserType.PLAYER })
  role: UserType;

  @Column({ nullable: true })
  imgUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  genre: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  skillfulFoot: string;

  @Column({ nullable: true })
  bodyStructure: string;

  @Column('simple-array', { nullable: true })
  abilities: string[];

  @Column({ nullable: true })
  nameAgency: string; 
/* 
  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile; */
  
  @OneToMany(() => Job, (jobs) => jobs.recruiter)
  jobs: Job[];
}
