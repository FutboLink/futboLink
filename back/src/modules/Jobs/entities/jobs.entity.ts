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

@Entity('jobs')
export class Job {
  @ApiProperty({ description: 'ID del trabajo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Se busca delantero', description: 'Que haga goles' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Se busca un delantero como Messi', description: 'Que juegue como Messi y que cobre como el Pulga Rodriguez' })
  @Column()
  description: string;

  @ApiProperty({ example: 'Presencial', description: 'Ubicación del trabajo' })
  @Column()
  location: string;

  @ApiProperty({ example: 60000, description: 'Salario anual en dólares' })
  @Column('decimal')
  salary: number;

  @ApiProperty({ example: '2024-12-01T12:34:56Z', description: 'Fecha de creación del trabajo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: 'OPEN', description: 'Estado del trabajo' })
  @Column({ default: 'OPEN' })
  status: string;

  @ApiProperty({ example: 'Tiempo completo', description: 'Tipo de oferta laboral' })
  @Column()
  offerType: string;

  @ApiProperty({ example: 'Delantero', description: 'Nivel de posición' })
  @Column()
  position: string;

  @ApiProperty({ example: ['zurdo', 'definición'], description: 'Competencias requeridas' })
  @Column('simple-array')
  competencies: string[];

  @ApiProperty({ example: ['USA', 'Argentina'], description: 'Países disponibles' })
  @Column('simple-array')
  countries: string[];

  @ApiProperty({ example: 'https://example.com/job.png', description: 'URL de la imagen del trabajo' })
  @Column()
  imgUrl: string;

  @ApiProperty({ example: 'Presencial', description: 'Tipo de trabajo' })
  @Column()
  type: string;

  @ApiProperty({ type: () => User, description: 'Reclutador que creó la oferta' })
  @ManyToOne(() => User, (user) => user.jobs)
  recruiter: User;

  @ApiProperty({ type: () => [Application], description: 'Aplicaciones al trabajo' })
  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}
