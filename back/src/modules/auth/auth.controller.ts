import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";
import { LoginUserDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";

@ApiTags('Auth') 
@Controller('login')
export class authController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Login del usuario', description: 'Permine iniciar sesion al usuario' })
    @ApiBody({ type: LoginUserDto, description: 'email y password.' })
    @Post('/')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto.email, loginUserDto.password);
    }
}