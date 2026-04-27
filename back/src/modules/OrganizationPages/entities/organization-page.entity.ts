import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum OrganizationPageType {
  CLUB = 'CLUB',
  ACADEMY = 'ACADEMY',
  TOURNAMENT_ORGANIZER = 'TOURNAMENT_ORGANIZER',
  FORMATION_SCHOOL = 'FORMATION_SCHOOL',
  AGENCY = 'AGENCY',
  LEAGUE = 'LEAGUE',
  FEDERATION = 'FEDERATION',
  NATIONAL_TEAM = 'NATIONAL_TEAM',
}

export enum OrganizationPageStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEACTIVATED = 'DEACTIVATED',
}

@Entity('organization_pages')
export class OrganizationPage {
  @ApiProperty({ description: 'ID de la página de organización' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: OrganizationPageType, description: 'Tipo de organización' })
  @Index()
  @Column({ type: 'enum', enum: OrganizationPageType })
  type: OrganizationPageType;

  @ApiProperty({ example: 'Club Atlético River Plate' })
  @Column()
  name: string;

  @ApiProperty({ example: 'club-atletico-river-plate', description: 'Slug único' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ example: 'Argentina', nullable: true })
  @Column({ nullable: true })
  country?: string;

  @ApiProperty({ example: 'Buenos Aires', nullable: true })
  @Column({ nullable: true })
  region?: string;

  @ApiProperty({ example: '1901', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  foundationYear?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  logoUrl?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  bannerUrl?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  website?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  contactEmail?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'Redes sociales',
    example: { twitter: '@club', instagram: '@club' },
  })
  @Column({ type: 'jsonb', default: {} })
  socialMedia: Record<string, string>;

  @ApiProperty({ enum: OrganizationPageStatus, default: OrganizationPageStatus.DRAFT })
  @Index()
  @Column({
    type: 'enum',
    enum: OrganizationPageStatus,
    default: OrganizationPageStatus.DRAFT,
  })
  status: OrganizationPageStatus;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner?: User;

  @ApiProperty({ nullable: true, description: 'Solo aplica cuando type=CLUB' })
  @Column({ type: 'uuid', nullable: true })
  leagueId?: string;

  @ManyToOne(() => OrganizationPage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leagueId' })
  league?: OrganizationPage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
