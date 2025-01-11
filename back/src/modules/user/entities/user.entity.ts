import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../roles.enum';
import { Job } from 'src/modules/Jobs/entities/jobs.entity';
import { Application } from 'src/modules/Applications/entities/applications.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678', description: 'ID del usuario' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Conti', description: 'Primer nombre del usuario' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Ejemplo', description: 'Apellido del usuario' })
  @Column()
  lastname: string;

  @ApiProperty({ example: 'conti@example.com', description: 'Email del usuario' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @Column()
  password: string;

  @ApiProperty({ example: UserType.PLAYER, description: 'Rol del usuario', enum: UserType })
  @Column({ default: UserType.PLAYER })
  role: UserType;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'URL de la img de perfil', nullable: true })
  @Column({ nullable: true })
  imgUrl: string;

  @ApiProperty({ description: 'Listado de postulaciones del usuario', type: () => [Application] })
  @OneToMany(() => Application, (application) => application.player)
  applications: Application[];

  @ApiProperty({ description: 'Lista de trabajos creados por el usuario', type: () => [Job] })
  @OneToMany(() => Job, (job) => job.recruiter)
  jobs: Job[];
}
