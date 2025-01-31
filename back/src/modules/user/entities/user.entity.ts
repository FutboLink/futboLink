import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../roles.enum';
import { Job } from 'src/modules/Jobs/entities/jobs.entity';
import { Application } from 'src/modules/Applications/entities/applications.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'e58a5d5b-ffec-4f57-b6a5-2a5f12345678',
    description: 'ID del usuario',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Conti', description: 'Primer nombre del usuario' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Ejemplo', description: 'Apellido del usuario' })
  @Column()
  lastname: string;

  @ApiProperty({ example: 'Agencia de Talentos', description: 'Nombre de la agencia (opcional)', nullable: true })
  @Column({ nullable: true })
  nameAgency?: string;

  @ApiProperty({
    example: 'conti@example.com',
    description: 'Email del usuario',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @Column()
  password: string;

  @ApiProperty({
    example: UserType.PLAYER,
    description: 'Rol del usuario',
    enum: UserType,
  })
  @Column({ default: UserType.PLAYER })
  role: UserType;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'URL de la img de perfil', nullable: true })
  @Column({ nullable: true })
  imgUrl?: string;

  @ApiProperty({ example: '+123456789', description: 'Número de teléfono', nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ example: 'Argentina', description: 'Nacionalidad del usuario', nullable: true })
  @Column({ nullable: true })
  nationality?: string;

  @ApiProperty({ example: 'Buenos Aires', description: 'Ubicación del usuario', nullable: true })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ example: 'Masculino', description: 'Género del usuario', nullable: true })
  @Column({ nullable: true })
  genre?: string;

  @ApiProperty({ example: '1990-01-01', description: 'Fecha de nacimiento', nullable: true })
  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @ApiProperty({ example: 180, description: 'Altura en cm', nullable: true })
  @Column({ type: 'int', nullable: true })
  height?: number;

  @ApiProperty({ example: 75, description: 'Peso en kg', nullable: true })
  @Column({ type: 'int', nullable: true })
  weight?: number;

  @ApiProperty({ example: 'Derecho', description: 'Pie hábil', nullable: true })
  @Column({ nullable: true })
  skillfulFoot?: string;

  @ApiProperty({ example: 'Atlética', description: 'Estructura corporal', nullable: true })
  @Column({ nullable: true })
  bodyStructure?: string;

  @ApiProperty({ example: ['Tiro Libre', 'Velocidad'], description: 'Habilidades', nullable: true })
  @Column('text', { array: true, nullable: true })
  habilities?: string[];

  @ApiProperty({ description: 'Listado de postulaciones del usuario', type: () => [Application] })
  @OneToMany(() => Application, (application) => application.player)
  applications: Application[];

  @ApiProperty({ description: 'Lista de trabajos creados por el usuario', type: () => [Job] })
  @OneToMany(() => Job, (job) => job.recruiter)
  jobs: Job[];

  @ApiProperty({ example: 'https://example.com/video.mp4', description: 'URL de video del usuario', nullable: true })
  @Column({ nullable: true })
  videoUrl?: string;

  @ApiProperty({
    description: 'Redes sociales del usuario (opcional)',
    example: { instagram: '@usuario', twitter: '@usuario', facebook: '@usuario' },
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  socialMedia?: Record<string, string>;

  @ApiProperty({
    description: 'Puestos del usuario (opcional)',
    example: [{ position: 'Delantero', experience: 5 }],
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  puesto?: { position: string; experience: number }[];

  
}
