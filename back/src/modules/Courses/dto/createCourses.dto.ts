import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum CategoryCursos {
  Curso = 'Curso',
  Master = 'Master',
  Seminario = 'Seminario',
  Diplomatura = 'Diplomatura',
  Pruebas = 'Pruebas',
  Tryouts = 'Tryouts',
}

export class CreateCursoDto {
  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: ['Curso', 'Master', 'Seminario', 'Diplomatura', 'Pruebas', 'Tryouts'], type: String })
  @IsEnum(CategoryCursos)
  category: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  modality: string;

  @ApiProperty()
  @IsString()
  contact: string;
}

export class UpdateCursoDto extends CreateCursoDto {}