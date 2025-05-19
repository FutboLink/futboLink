import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('SuccessCases')
export class SuccessCase {
    @ApiProperty({ description: 'Id del caso de éxito' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Nombre de la persona' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Rol o posición' })
    @Column()
    role: string;

    @ApiProperty({ description: 'Testimonio breve' })
    @Column()
    testimonial: string;

    @ApiProperty({ description: 'URL de la imagen' })
    @Column()
    imgUrl: string;

    @ApiProperty({ description: 'Descripción larga del caso de éxito', required: false })
    @Column({ type: 'text', nullable: true })
    longDescription: string;

    @ApiProperty({ description: 'Fecha de creación' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Estado de publicación' })
    @Column({ default: true })
    isPublished: boolean;
} 