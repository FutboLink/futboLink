import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PasaporteUe, UserType } from '../roles.enum';
import { Job } from 'src/modules/Jobs/entities/jobs.entity';
import { Application } from 'src/modules/Applications/entities/applications.entity';
import { Subscription } from 'src/modules/Subscriptions/entities/subscription.entity';

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
    example: 'Kinesiólogo, utilero,etc',
    description: 'Puesto del usuario',
  })
  @Column({ nullable: true })
 puesto?: string;


  @ApiProperty({
    example: UserType.PLAYER,
    description: 'Rol del usuario',
    enum: UserType,
  })
  @Column({ default: UserType.PLAYER })
  role: UserType;

  @ApiProperty({description: 'Club del jugador'})
  @Column({nullable:true})
  club?: string

  @ApiProperty({ example: '2024-01-01', description: 'Fecha de inicio en el club', nullable: true })
  @Column({ nullable: true })
  fechaInicio?: string;

  @ApiProperty({ example: '2025-01-01', description: 'Fecha de finalización en el club', nullable: true })
  @Column({ nullable: true })
  fechaFinalizacion?: string;

  @ApiProperty({ example: 'Primera División', description: 'Categoría del equipo', nullable: true })
  @Column({ nullable: true })
  categoriaEquipo?: string;

  @ApiProperty({ example: 'Alto', description: 'Nivel de competencia', nullable: true })
  @Column({ nullable: true })
  nivelCompetencia?: string;

  @ApiProperty({ example: 'Goleador de la liga', description: 'Logros del usuario', nullable: true })
  @Column({ nullable: true })
  logros?: string;

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

  @ApiProperty({ example: 'España', description: 'País donde puede trabajar' })
  @Column({ nullable: true })
  countryToWork?: string;

  @ApiProperty({ example: PasaporteUe.SI, description: '¿Tiene pasaporte de la UE?', enum: PasaporteUe })
  @Column({ type: 'enum', enum: PasaporteUe, nullable: true })
  pasaporteUe?: PasaporteUe;

  @ApiProperty({ example: 180, description: 'Altura en cm', nullable: true })
  @Column({ type: 'int', nullable: true })
  height?: number;

  @ApiProperty({ example: 18, description: 'Edad del usuario', nullable: true })
  @Column({ type: 'int', nullable: true })
  age?: number;

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

  @ApiProperty({ example: 'Delantero', description: 'Posición primaria' })
  @Column({ nullable: true })
  primaryPosition?: string;

  @ApiProperty({ example: 'Extremo', description: 'Posición secundaria', nullable: true })
  @Column({ nullable: true })
  secondaryPosition?: string;

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
    example: { twitter: '@usuario', trasnfermarkt: '@usuario',youtube: '@usuario' },
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  socialMedia?: Record<string, string>;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({
    description: 'Puestos del usuario (opcional)',
    example: [{ position: 'Delantero', experience: 5 }],
    nullable: true,
  })
  puestoDeportivo?: { position: string; experience: number }[];

  
  @ApiProperty({ description: 'Suscripción del usuario' })
  
  @JoinColumn()
  @Column({ nullable: true })
  subscription?: string;

  @ApiProperty({ description: 'CV del usuario (archivo PDF o TXT)', nullable: true })
  @Column({ nullable: true })
  cv?: string;

  
}
