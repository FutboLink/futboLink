import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CategoryCursos } from '../dto/createCourses.dto';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  image: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: CategoryCursos })
  category: CategoryCursos;

  @Column()
  country: string;

  @Column()
  language: string;

  @Column()
  modality: string;

  @Column()
  contact: string;
}