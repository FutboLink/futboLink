import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Application } from 'src/modules/Applications/entities/applications.entity';
import { YesOrNo, YesOrNotravell } from '../jobs.enum';

@Entity('jobs')
export class Job {
  @ApiProperty({ description: 'ID del trabajo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Se busca delantero', description: 'Que haga goles' })
  @Column()
  title: string;


  @ApiProperty({ example: 'Presencial', description: 'Ubicación del trabajo' })
  @Column()
  location: string;

  @ApiProperty({ example: 60000, description: 'Salario anual en dólares' })
  @Column('decimal')
  salary: number;

  @ApiProperty({
    example: '2024-12-01T12:34:56Z',
    description: 'Fecha de creación del trabajo',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: 'Se busca un delantero como Messi',
    description: 'Que juegue como Messi y que cobre como el Pulga Rodriguez',
  })
  @Column()
  description: string;

  @ApiProperty({ example: 'OPEN', description: 'Estado del trabajo' })
  @Column({ default: 'OPEN' })
  status: string;

  @ApiProperty({
    example: 'Tiempo completo',
    description: 'Tipo de oferta laboral',
  })
  @Column()
  contractDurations: string;

  @ApiProperty({ example: 'Delantero', description: 'Nivel de posición' })
  @Column()
  position: string;

  @ApiProperty({
    example: ['Sueldo fijo', 'Bonos por rendimiento', 'Viáticos incluidos', 'Alojamiento incluido', 'No remunerado', 'A convenir', 'Equipamiento deportivo'],
    description: 'Competencias requeridas',
  })
  @Column('simple-array')
  extra: string[];

  @ApiProperty({ example: 'USA', description: 'Países disponibles' })
  @Column()
  nationality: string;

  @ApiProperty({
    example: 'https://example.com/job.png',
    description: 'URL de la imagen del trabajo',
  })
  @Column()
  imgUrl: string;

  @ApiProperty({ example: 'Presencial', description: 'Tipo de trabajo' })
  @Column()
  contractTypes: string;

  @ApiProperty({
    description: 'Categoría del trabajo',
    example: 'Profesional',
  })
  @Column()
  category: string;

  @ApiProperty({
    description: 'Género del deporte',
    example: 'Masculino',
  })
  @Column()
  sportGenres: string;

  @ApiProperty({
    description: 'Edad mínima del trabajador',
    example: 18,
  })
  @Column()
  minAge: number;

  @ApiProperty({
    description: 'Edad máxima del trabajador',
    example: 35,
  })
  @Column()
  maxAge: number; 


  @ApiProperty({
    description: 'Deporte relacionado con el trabajo',
    example: 'Fútbol 11',
  })
  @Column()
  sport: string;

  @ApiProperty({
    description: 'Experiencia mínima necesaria para el trabajo',
    example: 'Semiprofesional',
  })
  @Column()
  minExperience: string;

  @ApiProperty({
    description: 'Disponibilidad para viajar',
    example: 'yes',
  })
  @Column({
    type: 'enum',
    enum: YesOrNo,
  })
  availabilityToTravel: YesOrNotravell;

  @ApiProperty({
    description: '¿Requiere pasaporte de la UE?',
    example: 'no',
  })
  @Column({
    type: 'enum',
    enum: YesOrNo,
  })
  euPassport: YesOrNo;

  @ApiProperty({
    description: 'Gmail del usuario (opcional)',
    example: 'user@example.com',
    required: false,
  })
  @Column({ nullable: true })
  gmail?: string;

  @ApiProperty({
    type: () => User,
    description: 'Reclutador que creó la oferta',
  })
  @ManyToOne(() => User, (user) => user.jobs)
  recruiter: User;

  @ApiProperty({
    type: () => [Application],
    description: 'Aplicaciones al trabajo',
  })
  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}
