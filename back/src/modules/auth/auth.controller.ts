import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, ResetPasswordDto } from '../Mailing/email.dto';

@ApiTags('Auth')
@Controller('login')
export class authController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login del usuario',
    description: 'Permine iniciar sesion al usuario',
  })
  @ApiBody({ type: LoginUserDto, description: 'email y password.' })
  @Post('/')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto.email, loginUserDto.password);
  }

  
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer la contraseña con un token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

}
