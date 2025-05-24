import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  Query,
  } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';


@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: User,
  })
  @Post('register')
  create(@Body() createUserDto: RegisterUserDto) {
    return this.userService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Traer los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [User] })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Traer usuario por Id' })
  @ApiResponse({ status: 200, description: 'Detalles del usaurio', type: User })
  @ApiResponse({ status: 404, description: 'UUsuario no encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Eliminar usuariopor ID' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Put(':id')
  @ApiBody({ type: RegisterUserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() user: Partial<User>,
  ) {
    return this.userService.updateUser(id, user);
  }
  
  /**
   * Actualiza el tipo de suscripción de un usuario
   */
  @ApiOperation({ summary: 'Actualizar tipo de suscripción de un usuario' })
  @ApiResponse({ status: 200, description: 'Suscripción actualizada' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Put(':id/subscription')
  async updateSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { subscriptionType: string }
  ) {
    return this.userService.updateUserSubscription(id, data.subscriptionType);
  }
  
  /**
   * Obtiene la información de suscripción de un usuario
   */
  @ApiOperation({ summary: 'Obtener información de suscripción de un usuario' })
  @ApiResponse({ status: 200, description: 'Información de suscripción' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':id/subscription')
  async getSubscription(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserSubscription(id);
  }
  
  /**
   * Actualiza el tipo de suscripción de un usuario por email
   */
  @ApiOperation({ summary: 'Actualizar tipo de suscripción por email' })
  @ApiResponse({ status: 200, description: 'Suscripción actualizada' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Put('subscription/update-by-email')
  async updateSubscriptionByEmail(
    @Body() data: { email: string, subscriptionType: string }
  ) {
    return this.userService.updateUserSubscriptionByEmail(data.email, data.subscriptionType);
  }
  
  /**
   * Obtiene la información de suscripción de un usuario por email
   */
  @ApiOperation({ summary: 'Obtener información de suscripción por email' })
  @ApiResponse({ status: 200, description: 'Información de suscripción' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get('subscription/check')
  async getSubscriptionByEmail(@Query('email') email: string) {
    return this.userService.getUserSubscriptionByEmail(email);
  }
}