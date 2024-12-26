import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @IsString()
  offerType: string;

  @IsString()
  position: string;

  @IsArray()
  competencies: string[];

  @IsArray()
  countries: string[];

  @IsString()
  imgUrl: string;

  @IsString()
  type: string;
}

