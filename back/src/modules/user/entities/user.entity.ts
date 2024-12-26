import { Job } from 'src/modules/Jobs/entities/jobs.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  /* import { Profile } from './profile.entity'; */
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar', length: 255 })
    name: string;
  
    @Column({ type: 'varchar', length: 255 })
    lastname: string;
  
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;
  
    @Column({ type: 'varchar', length: 255 })
    password: string;
  
    @Column({ type: 'varchar', length: 50 })
    role: 'postulant' | 'recruiter' | 'agency'; // Enum-like role for clarity
  
/*     @OneToOne(() => Profile, { cascade: true, eager: true })
    @JoinColumn()
    profile: Profile; */
  
    @Column({ type: 'varchar', nullable: true })
    imgUrl: string;
  
    @Column({ type: 'varchar', nullable: true })
    phone: string;
  
    @Column({ type: 'varchar', nullable: true })
    nationality: string;
  
    @Column({ type: 'varchar', nullable: true })
    location: string;
  
    @Column({ type: 'varchar', nullable: true })
    genre: 'male' | 'female' | 'other';
  
    @Column({ type: 'date', nullable: true })
    birthday: Date;
  
    @Column({ type: 'float', nullable: true })
    height: number;
  
    @Column({ type: 'float', nullable: true })
    weight: number;
  
    @Column({ type: 'varchar', nullable: true })
    skillfulFoot: 'left' | 'right' | 'both';
  
    @Column({ type: 'varchar', nullable: true })
    bodyStructure: string;
  
    @Column({ type: 'text', nullable: true })
    habilities: string; 

    @OneToMany(() => Job, (job) => job.recruiter, { cascade: true })
    jobs: Job[];
  }
