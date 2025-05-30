import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('videos')
export class Video {
  @ApiProperty({ example: 'uuid', description: 'The unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Tutorial Title', description: 'The title of the video' })
  @Column()
  title: string;

  @ApiProperty({ example: 'This is a description', description: 'The description of the video' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=videoId', description: 'The URL of the video' })
  @Column()
  videoUrl: string;

  @ApiProperty({ example: 'Tutorial', description: 'The category of the video' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ example: 'thumbnail.jpg', description: 'The thumbnail URL of the video' })
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ApiProperty({ example: true, description: 'Whether the video is published' })
  @Column({ default: true })
  isPublished: boolean;

  @ApiProperty({ example: '2023-01-01', description: 'The date the video was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-02', description: 'The date the video was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
} 