import { IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {
    @ApiProperty({
        description: "Email del usuario",
        example: "juan.perez@example.com",
        type: String,
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: "Contraseña (Min 8 caracteres)",
        example: "password123",
        type: String,
        minLength: 8,
    })
    @MinLength(8)
    password: string;
}
