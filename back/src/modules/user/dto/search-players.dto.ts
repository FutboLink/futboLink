import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPlayersDto {
  @ApiProperty({ 
    description: 'Nombre o apellido del jugador', 
    required: false,
    example: 'Messi'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Posición primaria del jugador', 
    required: false,
    example: 'Delantero'
  })
  @IsOptional()
  @IsString()
  primaryPosition?: string;

  @ApiProperty({ 
    description: 'Nacionalidad del jugador', 
    required: false,
    example: 'Argentina'
  })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ 
    description: 'Edad mínima', 
    required: false,
    example: 18
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minAge?: number;

  @ApiProperty({ 
    description: 'Edad máxima', 
    required: false,
    example: 40
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxAge?: number;

  @ApiProperty({ 
    description: 'Altura mínima en cm', 
    required: false,
    example: 170
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minHeight?: number;

  @ApiProperty({ 
    description: 'Altura máxima en cm', 
    required: false,
    example: 190
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxHeight?: number;

  @ApiProperty({ 
    description: 'Pie hábil', 
    required: false,
    example: 'Derecho'
  })
  @IsOptional()
  @IsString()
  skillfulFoot?: string;

  @ApiProperty({ 
    description: 'Número de resultados por página', 
    required: false,
    default: 10,
    example: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ 
    description: 'Número de resultados a saltar', 
    required: false,
    default: 0,
    example: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}

export class SearchUsersDto extends SearchPlayersDto {
  @ApiProperty({ 
    description: 'Rol del usuario (PLAYER o RECRUITER)', 
    required: false,
    example: 'PLAYER',
    enum: ['PLAYER', 'RECRUITER']
  })
  @IsOptional()
  @IsString()
  role?: string;
} 