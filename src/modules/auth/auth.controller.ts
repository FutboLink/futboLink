import { Body, Controller, Post } from "@nestjs/common";
import { LoginUserDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";

@Controller('login')
export class authController{
    constructor(private readonly authService: AuthService) {}
    
    @Post('/')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto.email, loginUserDto.password);
    }
}