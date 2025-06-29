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
  UseGuards,
  Req,
  UnauthorizedException,
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
import { SearchPlayersDto } from './dto/search-players.dto';
import { AuthGuard } from '../auth/auth.guard';


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
   * Endpoint específico para actualizar la suscripción desde el panel admin
   */
  @ApiOperation({ summary: 'Actualizar suscripción de usuario desde el panel admin' })
  @ApiResponse({ status: 200, description: 'Suscripción actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Put('update-subscription/:id')
  async updateUserSubscriptionAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { subscriptionType: string, subscriptionExpiresAt?: Date }
  ) {
    const { subscriptionType, subscriptionExpiresAt } = data;
    // Si se proporciona una fecha de expiración, usarla; de lo contrario, usar lógica predeterminada
    if (subscriptionExpiresAt) {
      return this.userService.updateUserSubscriptionWithExpiration(id, subscriptionType, subscriptionExpiresAt);
    } else {
      return this.userService.updateUserSubscription(id, subscriptionType);
    }
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

  /**
   * Busca jugadores con filtros (solo para suscriptores profesionales)
   */
  @ApiOperation({ summary: 'Buscar jugadores con filtros (solo para suscriptores profesionales)' })
  @ApiResponse({ status: 200, description: 'Lista de jugadores filtrados' })
  @ApiResponse({ status: 401, description: 'No autorizado - Se requiere suscripción profesional' })
  @UseGuards(AuthGuard)
  @Get('search/players')
  async searchPlayers(
    @Query() searchDto: SearchPlayersDto,
    @Req() req: any
  ) {
    // Verificar que el usuario tiene suscripción profesional
    const user = req.user;
    
    // Obtener la información de suscripción
    const subscription = await this.userService.getUserSubscription(user.id);
    
    // Solo permitir acceso a usuarios con suscripción profesional
    if (subscription.subscriptionType !== 'Profesional' || !subscription.isActive) {
      throw new UnauthorizedException(
        'Se requiere una suscripción profesional activa para acceder a esta funcionalidad'
      );
    }
    
    return this.userService.searchPlayers(searchDto);
  }
}