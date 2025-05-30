import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ example: 'Tutorial Title', description: 'The title of the video' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is a description', description: 'The description of the video', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=videoId', description: 'The URL of the video' })
  @IsString()
  @IsUrl()
  videoUrl: string;

  @ApiProperty({ example: 'Tutorial', description: 'The category of the video', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'thumbnail.jpg', description: 'The thumbnail URL of the video', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: true, description: 'Whether the video is published', required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {} 