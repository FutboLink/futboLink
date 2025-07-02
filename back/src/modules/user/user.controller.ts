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
import { PortfolioRequestDto } from './dto/portfolio-request.dto';
import { CreateRepresentationRequestDto, UpdateRepresentationRequestDto } from './dto/representation-request.dto';
import { RepresentationRequest } from './entities/representation-request.entity';


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
   * Busca jugadores con filtros (para suscriptores profesionales y reclutadores)
   */
  @ApiOperation({ summary: 'Buscar jugadores con filtros (para suscriptores profesionales y reclutadores)' })
  @ApiResponse({ status: 200, description: 'Lista de jugadores filtrados' })
  @ApiResponse({ status: 401, description: 'No autorizado - Se requiere suscripción profesional o ser reclutador' })
  @UseGuards(AuthGuard)
  @Get('search/players')
  async searchPlayers(
    @Query() searchDto: SearchPlayersDto,
    @Req() req: any
  ) {
    // Verificar que el usuario tiene suscripción profesional o es un reclutador
    const user = req.user;
    
    // Permitir acceso directo a reclutadores
    if (user.role === 'RECRUITER' || user.role === 'ADMIN') {
      return this.userService.searchPlayers(searchDto);
    }
    
    // Para otros roles, verificar suscripción profesional
    const subscription = await this.userService.getUserSubscription(user.id);
    
    // Solo permitir acceso a usuarios con suscripción profesional
    if (subscription.subscriptionType !== 'Profesional' || !subscription.isActive) {
      throw new UnauthorizedException(
        'Se requiere una suscripción profesional activa para acceder a esta funcionalidad'
      );
    }
    
    return this.userService.searchPlayers(searchDto);
  }

  @ApiOperation({ summary: 'Añadir un jugador a la cartera del reclutador' })
  @ApiResponse({
    status: 200,
    description: 'Jugador añadido a la cartera correctamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Jugador o reclutador no encontrado' })
  @UseGuards(AuthGuard)
  @Post(':id/portfolio')
  async addPlayerToPortfolio(
    @Param('id', ParseUUIDPipe) recruiterId: string,
    @Body() portfolioRequestDto: PortfolioRequestDto,
    @Req() req: any,
  ) {
    // Verificar que el usuario autenticado es el mismo reclutador o un admin
    if (req.user.id !== recruiterId && req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('No tienes permiso para modificar esta cartera');
    }
    
    return this.userService.addPlayerToPortfolio(recruiterId, portfolioRequestDto.playerId);
  }

  @ApiOperation({ summary: 'Eliminar un jugador de la cartera del reclutador' })
  @ApiResponse({
    status: 200,
    description: 'Jugador eliminado de la cartera correctamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Jugador o reclutador no encontrado' })
  @UseGuards(AuthGuard)
  @Delete(':id/portfolio/:playerId')
  async removePlayerFromPortfolio(
    @Param('id', ParseUUIDPipe) recruiterId: string,
    @Param('playerId', ParseUUIDPipe) playerId: string,
    @Req() req: any,
  ) {
    // Verificar que el usuario autenticado es el mismo reclutador o un admin
    if (req.user.id !== recruiterId && req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('No tienes permiso para modificar esta cartera');
    }
    
    return this.userService.removePlayerFromPortfolio(recruiterId, playerId);
  }

  @ApiOperation({ summary: 'Obtener la cartera de jugadores del reclutador' })
  @ApiResponse({
    status: 200,
    description: 'Lista de jugadores en la cartera',
    type: [User],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Reclutador no encontrado' })
  @UseGuards(AuthGuard)
  @Get(':id/portfolio')
  async getPortfolioPlayers(
    @Param('id', ParseUUIDPipe) recruiterId: string,
    @Req() req: any,
  ) {
    // Cualquier usuario autenticado puede ver la cartera
    return this.userService.getPortfolioPlayers(recruiterId);
  }

  @ApiOperation({ summary: 'Enviar solicitud de representación a un jugador' })
  @ApiResponse({
    status: 201,
    description: 'Solicitud enviada correctamente',
    type: RepresentationRequest,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Jugador o reclutador no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe una solicitud pendiente' })
  @UseGuards(AuthGuard)
  @Post(':id/representation-request')
  async sendRepresentationRequest(
    @Param('id', ParseUUIDPipe) recruiterId: string,
    @Body() createRepresentationRequestDto: CreateRepresentationRequestDto,
    @Req() req: any,
  ) {
    // Verificar que el usuario autenticado es el mismo que envía la solicitud
    if (req.user.id !== recruiterId) {
      throw new UnauthorizedException('No tienes permiso para realizar esta acción');
    }
    
    return this.userService.sendRepresentationRequest(
      recruiterId,
      createRepresentationRequestDto,
    );
  }

  @ApiOperation({ summary: 'Responder a una solicitud de representación' })
  @ApiResponse({
    status: 200,
    description: 'Solicitud respondida correctamente',
    type: RepresentationRequest,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @UseGuards(AuthGuard)
  @Put('representation-request/:requestId')
  async respondToRepresentationRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() updateRepresentationRequestDto: UpdateRepresentationRequestDto,
    @Req() req: any,
  ) {
    // El jugador que responde debe ser el destinatario de la solicitud
    return this.userService.respondToRepresentationRequest(
      requestId,
      req.user.id,
      updateRepresentationRequestDto,
    );
  }

  @ApiOperation({ summary: 'Obtener solicitudes de representación enviadas por un reclutador' })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes enviadas',
    type: [RepresentationRequest],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(AuthGuard)
  @Get(':id/sent-requests')
  async getRecruiterSentRequests(
    @Param('id', ParseUUIDPipe) recruiterId: string,
    @Req() req: any,
  ) {
    // Verificar que el usuario autenticado es el mismo que consulta
    if (req.user.id !== recruiterId) {
      throw new UnauthorizedException('No tienes permiso para realizar esta acción');
    }
    
    return this.userService.getRecruiterSentRequests(recruiterId);
  }

  @ApiOperation({ summary: 'Obtener solicitudes de representación recibidas por un jugador' })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes recibidas',
    type: [RepresentationRequest],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(AuthGuard)
  @Get(':id/received-requests')
  async getPlayerReceivedRequests(
    @Param('id', ParseUUIDPipe) playerId: string,
    @Req() req: any,
  ) {
    // Verificar que el usuario autenticado es el mismo que consulta
    if (req.user.id !== playerId) {
      throw new UnauthorizedException('No tienes permiso para realizar esta acción');
    }
    
    return this.userService.getPlayerReceivedRequests(playerId);
  }
}