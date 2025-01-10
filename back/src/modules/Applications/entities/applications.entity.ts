import { ApiProperty } from '@nestjs/swagger';
import { Job } from "src/modules/Jobs/entities/jobs.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Application {
  @ApiProperty({ example: 1, description: 'ID de las postulaciones' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => User, description: 'Usuario que aplica' })
  @ManyToOne(() => User, (user) => user.applications)
  player: User;

  @ApiProperty({ type: () => Job, description: 'Trabajo al que se aplica' })
  @ManyToOne(() => Job, (job) => job.applications)
  job: Job;

  @ApiProperty({ example: 'Estoy interesado en esta posición.', description: 'Mensaje del aplicante' })
  @Column('text')
  message: string;

  @ApiProperty({ enum: ['PENDING', 'ACCEPTED', 'REJECTED'], example: 'PENDING', description: 'Estado de la aplicación' })
  @Column({ type: 'enum', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' })
  status: string;

  @ApiProperty({ example: '2024-12-01T12:34:56Z', description: 'Fecha de aplicación' })
  @CreateDateColumn()
  appliedAt: Date;
}
