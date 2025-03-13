import { Application } from 'src/modules/Applications/entities/applications.entity';
<<<<<<< HEAD
import { YesOrNo, YesOrNotravell } from '../jobs.enum';
=======
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


export enum YesOrNo {
  YES = 'YES',
  NO = 'NO',
}
>>>>>>> develop

@Entity('jobs')
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

<<<<<<< HEAD

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
=======
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
>>>>>>> develop

  @Column()
  imgUrl: string;

<<<<<<< HEAD
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
=======
  @OneToMany(() => Application, (application) => application.job, { cascade: true })
>>>>>>> develop
  applications: Application[];
}
