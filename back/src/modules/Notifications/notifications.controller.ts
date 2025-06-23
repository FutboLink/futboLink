import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Notification } from './entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva notificación' })
  @ApiResponse({ status: 201, description: 'Notificación creada correctamente', type: Notification })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Post('profile-view')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar una visualización de perfil' })
  @ApiResponse({ status: 201, description: 'Notificación de visualización de perfil creada correctamente', type: Notification })
  createProfileView(
    @Body() body: { viewedUserId: string },
    @Req() req: any
  ) {
    const viewerUserId = req.user.id;
    return this.notificationsService.createProfileViewNotification(
      body.viewedUserId,
      viewerUserId
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las notificaciones' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones', type: [Notification] })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones del usuario', type: [Notification] })
  findMine(@Req() req: any) {
    return this.notificationsService.findByUserId(req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones del usuario', type: [Notification] })
  findByUserId(@Param('userId') userId: string) {
    return this.notificationsService.findByUserId(userId);
  }

  @Get('count')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar notificaciones no leídas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Número de notificaciones no leídas' })
  countUnread(@Req() req: any) {
    return this.notificationsService.countUnread(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada', type: Notification })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada', type: Notification })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída', type: Notification })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read/all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar todas las notificaciones del usuario como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
} 