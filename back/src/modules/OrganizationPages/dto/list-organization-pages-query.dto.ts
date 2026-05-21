import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationPageType } from '../entities/organization-page.entity';

export class ListOrganizationPagesQueryDto {
  @ApiPropertyOptional({ enum: OrganizationPageType })
  @IsOptional()
  @IsEnum(OrganizationPageType)
  type?: OrganizationPageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Búsqueda por nombre (ILIKE)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
