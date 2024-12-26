import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../../user/entities/user.entity';
  
  @Entity('jobs')
  export class Job {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column()
    description: string;
  
    @Column()
    location: string;
  
    @Column('decimal')
    salary: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @Column({ default: 'OPEN' })
    status: string;
  
    @Column()
    offerType: string;
  
    @Column()
    position: string;
  
    @Column('simple-array')
    competencies: string[];
  
    @Column('simple-array')
    countries: string[];
  
    @Column()
    imgUrl: string;
  
    @Column()
    type: string;
  
    @ManyToOne(() => User, (user) => user.jobs)
    recruiter: User;
  }