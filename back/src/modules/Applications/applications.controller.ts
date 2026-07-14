import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CreateApplicationsDto } from './dto/applications.dto';
import { RecruiterApplicationDto } from './dto/recruiter-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-status.dto';
import { ApplicationService } from './applications.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserType } from '../user/roles.enum';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva aplicación' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente' })
  async apply(@Body() createApplicationsDto: CreateApplicationsDto) {
    const { jobId, userId, message } = createApplicationsDto;
    const playerId = userId;
    const jobid = jobId;
    console.log(playerId);

    console.log(jobId);

    return this.applicationService.apply(playerId, jobid, message);
  }

  @Post('/recruiter-apply')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Reclutador postula a un jugador de su cartera a una oferta' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente' })
  @ApiResponse({ status: 403, description: 'No autorizado o el jugador no está en la cartera del reclutador' })
  async applyForPlayer(
    @Body() recruiterApplicationDto: RecruiterApplicationDto,
    @Req() req: any,
  ) {
    // Verificar que el usuario autenticado es un reclutador o una agencia
    if (
      req.user.role !== UserType.RECRUITER &&
      req.user.role !== UserType.AGENCY
    ) {
      throw new ForbiddenException(
        'Solo los reclutadores y agencias pueden usar esta función',
      );
    }

    const recruiterId = req.user.id;
    const { playerId, jobId, message, playerMessage } = recruiterApplicationDto;

    return this.applicationService.applyForPlayer(
      recruiterId,
      playerId,
      jobId,
      message,
      playerMessage
    );
  }

  @Get('/jobs/:id')
  @ApiOperation({ summary: 'Listar aplicaciones de un trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones' })
  async listApplications(@Param('id') jobId: string) {
    return this.applicationService.listApplications(jobId);
  }

  @Get('/player/:id')
  @ApiOperation({ summary: 'Listar las postulaciones de un jugador (panel)' })
  @ApiResponse({ status: 200, description: 'Postulaciones del jugador con su estado' })
  async findByPlayer(@Param('id') playerId: string) {
    return this.applicationService.findByPlayer(playerId);
  }

  @Get('/recruiter/:id')
  @ApiOperation({ summary: 'Listar las postulaciones hechas por un reclutador/agente' })
  @ApiResponse({ status: 200, description: 'Postulaciones hechas en nombre de jugadores de la cartera' })
  async findByRecruiter(@Param('id') recruiterId: string) {
    return this.applicationService.findByRecruiter(recruiterId);
  }

  @Post('/jobs/:id/review')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Marcar "En revisión" a los candidatos de una oferta (al abrir la lista)' })
  @ApiResponse({ status: 200, description: 'Candidatos marcados en revisión' })
  async markJobInReview(@Param('id') jobId: string, @Req() req: any) {
    return this.applicationService.markJobInReview(jobId, req.user.id);
  }

  @Patch('/:id/profile-viewed')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Marcar "Perfil visto" (al abrir el perfil de un candidato)' })
  @ApiResponse({ status: 200, description: 'Postulación marcada como perfil visto' })
  async markProfileViewed(@Param('id') applicationId: string, @Req() req: any) {
    return this.applicationService.markProfileViewed(applicationId, req.user.id);
  }

  @Patch('/profile-viewed/by-viewed-user/:viewedUserId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Marcar "Perfil visto" en todas las postulaciones del usuario visto a ofertas del viewer (al abrir su perfil)' })
  @ApiResponse({ status: 200, description: 'Postulaciones marcadas como perfil visto' })
  async markProfileViewedByViewedUser(
    @Param('viewedUserId') viewedUserId: string,
    @Req() req: any,
  ) {
    return this.applicationService.markProfileViewedByViewedUser(
      viewedUserId,
      req.user.id,
    );
  }

  @Patch('/:id/interest')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Botón "Me interesa" del ofertante sobre un candidato' })
  @ApiResponse({ status: 200, description: 'Interés registrado' })
  async markInterest(@Param('id') applicationId: string, @Req() req: any) {
    return this.applicationService.markInterest(applicationId, req.user.id);
  }

  @Patch('/:id/status')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Actualizar el estado de una aplicación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Estado inválido' })
  @ApiResponse({ status: 403, description: 'No sos el dueño de esta oferta' })
  async updateStatus(
    @Param('id') applicationId: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Req() req: any,
  ) {
    return this.applicationService.updateStatus(
      applicationId,
      updateStatusDto.status,
      req.user.id,
    );
  }

  @Post('/shortlist')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Seleccionar múltiples candidatos para evaluación' })
  @ApiResponse({ status: 200, description: 'Candidatos seleccionados correctamente' })
  async shortlistCandidates(
    @Body('applicationIds') applicationIds: string[],
    @Req() req: any,
  ) {
    const recruiterId = req.user.id;
    return this.applicationService.shortlistCandidates(applicationIds, recruiterId);
  }
}
