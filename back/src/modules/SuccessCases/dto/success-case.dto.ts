import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateSuccessCaseDto {
    @ApiProperty({ example: 'Juan Pérez' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'Jugador de Fútbol, 24 años — Argentino' })
    @IsNotEmpty()
    @IsString()
    role: string;

    @ApiProperty({ example: 'FutboLink me ayudó a conseguir mi primer contrato profesional...' })
    @IsNotEmpty()
    @IsString()
    testimonial: string;

    @ApiProperty({ example: 'https://example.com/image.jpg' })
    @IsNotEmpty()
    @IsString()
    @IsUrl()
    imgUrl: string;

    @ApiProperty({ 
        example: 'Historia completa del jugador y cómo FutboLink lo ayudó en su carrera...',
        required: false 
    })
    @IsOptional()
    @IsString()
    longDescription?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

export class UpdateSuccessCaseDto extends PartialType(CreateSuccessCaseDto) {}

export class PublishSuccessCaseDto {
    @ApiProperty({ example: true })
    @IsNotEmpty()
    @IsBoolean()
    isPublished: boolean;
} 