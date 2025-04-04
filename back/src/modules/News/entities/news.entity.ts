import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('News')
export class News{

    @ApiProperty({description:'Id de la noticia'})
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty({description:'Noticia de Futbol'})
    @Column()
    title:string; 

    @ApiProperty({description:'Descripción de la noticia'})
    @Column()
    description: string;

    @ApiProperty({description:'Url de la imagen'})
    @Column()
    imageUrl:string;
}
