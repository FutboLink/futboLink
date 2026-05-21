import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationPageType } from '../entities/organization-page.entity';

export class CreateOrganizationPageDto {
  @ApiProperty({ enum: OrganizationPageType })
  @IsEnum(OrganizationPageType)
  type: OrganizationPageType;

  @ApiProperty({ example: 'Club Atlético River Plate' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: '1901' })
  @IsOptional()
  @IsString()
  foundationYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.example.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'contacto@example.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+54 11 1234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: { twitter: '@club', instagram: '@club' },
  })
  @IsOptional()
  @IsObject()
  socialMedia?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Solo aplica cuando type=CLUB' })
  @IsOptional()
  @IsUUID()
  leagueId?: string;
}
