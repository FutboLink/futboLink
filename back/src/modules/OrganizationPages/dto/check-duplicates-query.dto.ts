import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationPageType } from '../entities/organization-page.entity';

export class CheckDuplicatesQueryDto {
  @ApiProperty({ enum: OrganizationPageType })
  @IsEnum(OrganizationPageType)
  type: OrganizationPageType;

  @ApiProperty({ minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}
