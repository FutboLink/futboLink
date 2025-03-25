import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateNewsDto{

    @ApiProperty({example:'Titulo de la noticia'})
    @IsNotEmpty()
    @IsString()
    title:string;

    @ApiProperty({example:'Descripcion de la noticia'})
    @IsString()
    description:string;

    @ApiProperty({example:'Id de la url de la imagen'})
    @IsString()
    imageUrl: string;
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}