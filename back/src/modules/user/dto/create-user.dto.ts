import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, IsString, IsDate, IsNumber, IsArray } from 'class-validator';
import { UserType } from '../roles.enum';
import { OneToMany } from 'typeorm';
import { Job } from 'src/modules/Jobs/entities/jobs.entity';

export class RegisterUserDto {
    @IsNotEmpty()
    name: string;
  
    @IsNotEmpty()
    lastname: string;

    @IsOptional()
    @IsString()
    nameAgency?: string;
  
    @IsEmail()
    email: string;
  
    @MinLength(8)
    password: string;
  
    @IsEnum(UserType)
    role?: UserType;
  
    @IsString()
    imgUrl?: string;
  
    @IsString()
    phone?: string;
  
    @IsString()
    nationality?: string;
  
    @IsString()
    location?: string;
  
    @IsString()
    genre?: string;
  
    @IsDate()
    birthday?: Date;
  
    @IsNumber()
    height?: number;
  
    @IsNumber()
    weight?: number;
  
    @IsString()
    skillfulFoot?: string;
  
    @IsString()
    bodyStructure?: string;
  
    @IsArray()
    @IsString({ each: true })
    abilities?: string[];

    
  

}
