import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/applications.entity';
import { User } from '../user/entities/user.entity';
import { Job } from '../Jobs/entities/jobs.entity';
import { UserType } from '../user/roles.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeService } from '../../payments/services/stripe.service';
import { UserService } from '../user/user.service';
import { NotificationsService } from '../Notifications/notifications.service';
import { NotificationType } from '../Notifications/entities/notification.entity';

@ApiTags('Applications')
@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @ApiOperation({ summary: 'Aplicar a un trabajo' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Jugador o trabajo no encontrado.' })
  @ApiResponse({ status: 409, description: 'Aplicación duplicada.' })
  @ApiResponse({ status: 403, description: 'Se requiere una suscripción activa para aplicar a trabajos.' })
  async apply(playerId: string, jobId: string, message: string): Promise<Application> {
    // Find the player
    const player = await this.userRepository.findOne({
      where: { id: String(playerId), role: UserType.PLAYER },
    });
    if (!player) throw new NotFoundException('El usuario no es jugador');

    console.log(`Verificando suscripción para: ${player.email} (usuario ${playerId})`);
    
    // Solución temporal para el usuario específico con problemas
    if (player.email === 'matiasolguin48@gmail.com') {
      console.log(`[SOLUCIÓN TEMPORAL] Actualizando manualmente la suscripción para: ${player.email}`);
      try {
        // Actualizar manualmente la suscripción del usuario
        await this.userService.updateUserSubscriptionByEmail(player.email, 'Profesional');
        console.log(`[SOLUCIÓN TEMPORAL] Suscripción actualizada manualmente a Profesional para: ${player.email}`);
      } catch (error) {
        console.error(`[SOLUCIÓN TEMPORAL] Error al actualizar la suscripción: ${error.message}`);
      }
    }
    
    // Verificar la suscripción usando UserService en lugar de StripeService
    try {
      const subscriptionStatus = await this.userService.getUserSubscriptionByEmail(player.email);
      console.log(`Estado de suscripción desde UserService: ${JSON.stringify(subscriptionStatus)}`);
      
      // Verificar si el usuario tiene una suscripción Semiprofesional o Profesional
      const validSubscriptionType = subscriptionStatus.subscriptionType === 'Semiprofesional' || 
                                   subscriptionStatus.subscriptionType === 'Profesional';
      
      // Verificar si el usuario puede aplicar
      if (validSubscriptionType) {
        console.log(`Usuario ${player.email} tiene suscripción ${subscriptionStatus.subscriptionType}. Permitiendo aplicar.`);
      } else {
        console.log(`Suscripción tipo ${subscriptionStatus.subscriptionType || 'no definida'} para ${player.email}, no permitida para aplicar`);
        throw new ForbiddenException('Se requiere una suscripción activa Semiprofesional o Profesional para aplicar a trabajos. Por favor, suscríbete para continuar.');
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error(`Error al verificar suscripción: ${error.message}`);
      throw new ForbiddenException('Error al verificar la suscripción. Por favor, intenta de nuevo más tarde.');
    }

    // Find the job
    const job = await this.jobRepository.findOne({ 
      where: { id: String(jobId) },
      relations: ['recruiter'],
    });
    if (!job) throw new NotFoundException('Trabajo no encontrado');

    // Check for duplicate applications
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        player: { id: String(playerId) },
        job: { id: String(jobId) },
      },
    });
    if (existingApplication) throw new ConflictException('Aplicación duplicada');

    // Create and save the application
    const application = this.applicationRepository.create({ player, job, message });
    return this.applicationRepository.save(application);
  }

  @ApiOperation({ summary: 'Listar aplicaciones por trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones encontrada.' })
  async listApplications(jobId: string, limit: number = 100): Promise<Application[]> {
    try {
      // Optimizado: Select específico y límite para reducir memoria
      return this.applicationRepository.find({
        where: { job: { id: String(jobId) } },
        relations: ['player'],
        select: {
          id: true,
          message: true,
          status: true,
          appliedAt: true,
          shortlistedAt: true,
          player: {
            id: true,
            name: true,
            lastname: true,
            email: true,
            role: true,
            imgUrl: true,
          }
        },
        take: limit,
        order: { appliedAt: 'DESC' }
      });
    } catch (error) {
      console.error('Error al listar aplicaciones con nuevos campos:', error.message);
      
      // Si falla, usar una consulta SQL directa optimizada con límite
      const rawApplications = await this.applicationRepository.query(`
        SELECT 
          a.id, a.message, a.status, a."appliedAt", a."shortlistedAt", a."playerId", a."jobId",
          u.id as player_id, u.name as player_name, u.lastname as player_lastname, 
          u.email as player_email, u.role as player_role, u."imgUrl" as player_imgUrl
        FROM application a
        LEFT JOIN users u ON u.id = a."playerId"
        WHERE a."jobId" = $1
        ORDER BY a."appliedAt" DESC
        LIMIT $2
      `, [jobId, limit]);
      
      // Transformar los resultados raw en entidades Application
      return rawApplications.map(raw => {
        const app = new Application();
        app.id = raw.id;
        app.message = raw.message;
        app.status = raw.status;
        app.appliedAt = raw.appliedAt;
        app.shortlistedAt = raw.shortlistedAt;
        
        // Crear el objeto player
        if (raw.player_id) {
          const player = new User();
          player.id = raw.player_id;
          player.name = raw.player_name;
          player.lastname = raw.player_lastname;
          player.email = raw.player_email;
          player.role = raw.player_role;
          player.imgUrl = raw.player_imgUrl;
          
          app.player = player;
        }
        
        return app;
      });
    }
  }

  @ApiOperation({ summary: 'Actualizar estado de una aplicación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Aplicación no encontrada.' })
  async updateStatus(applicationId: string, status: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({ 
      where: { id: applicationId },
      relations: ['player', 'job', 'job.recruiter'],
    });
    if (!application) throw new NotFoundException('Aplicación no encontrada');

    const oldStatus = application.status;
    application.status = status;

    // Si el estado cambia a SHORTLISTED, registrar la fecha
    if (status === ApplicationStatus.SHORTLISTED && oldStatus !== ApplicationStatus.SHORTLISTED) {
      application.shortlistedAt = new Date();
      
      // Enviar notificación al postulante
      if (application.player && application.job?.recruiter) {
        try {
          await this.notificationsService.create({
            message: `Tu perfil ha sido seleccionado para evaluación en la oferta "${application.job.title}"`,
            type: NotificationType.APPLICATION_SHORTLISTED,
            userId: application.player.id,
            sourceUserId: application.job.recruiter.id,
            metadata: {
              jobId: application.job.id,
              jobTitle: application.job.title,
              applicationId: application.id,
            }
          });
        } catch (error) {
          console.error('Error al enviar notificación:', error);
        }
      }
    }

    return this.applicationRepository.save(application);
  }

  @ApiOperation({ summary: 'Seleccionar múltiples candidatos para evaluación' })
  @ApiResponse({ status: 200, description: 'Candidatos seleccionados correctamente.' })
  async shortlistCandidates(applicationIds: string[], recruiterId: string): Promise<Application[]> {
    // Verificar que el reclutador existe
    const recruiter = await this.userRepository.findOne({
      where: { id: recruiterId }
    });
    if (!recruiter) throw new NotFoundException('Reclutador no encontrado');
    
    const shortlistedApplications: Application[] = [];
    
    for (const applicationId of applicationIds) {
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId },
        relations: ['player', 'job', 'job.recruiter'],
      });
      
      if (!application) {
        console.warn(`Aplicación con ID ${applicationId} no encontrada`);
        continue;
      }
      
      // Verificar que el reclutador es el dueño de la oferta
      if (application.job.recruiter.id !== recruiterId) {
        console.warn(`El reclutador ${recruiterId} no es el dueño de la oferta de la aplicación ${applicationId}`);
        continue;
      }
      
      // Actualizar estado y fecha
      application.status = ApplicationStatus.SHORTLISTED;
      application.shortlistedAt = new Date();
      
      // Guardar la aplicación actualizada
      const updatedApplication = await this.applicationRepository.save(application);
      shortlistedApplications.push(updatedApplication);
      
      // Enviar notificación al postulante
      if (application.player) {
        try {
          await this.notificationsService.create({
            message: `Tu perfil ha sido seleccionado para evaluación en la oferta "${application.job.title}"`,
            type: NotificationType.APPLICATION_SHORTLISTED,
            userId: application.player.id,
            sourceUserId: recruiterId,
            metadata: {
              jobId: application.job.id,
              jobTitle: application.job.title,
              applicationId: application.id,
            }
          });
        } catch (error) {
          console.error('Error al enviar notificación:', error);
        }
      }
    }
    
    return shortlistedApplications;
  }

  @ApiOperation({ summary: 'Reclutador postula a un jugador de su cartera a una oferta' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Jugador, trabajo o reclutador no encontrado.' })
  @ApiResponse({ status: 409, description: 'Aplicación duplicada.' })
  @ApiResponse({ status: 403, description: 'El jugador no está en la cartera del reclutador.' })
  async applyForPlayer(recruiterId: string, playerId: string, jobId: string, recruiterMessage: string, playerMessage?: string): Promise<Application> {
    // Verificar que el reclutador existe
    const recruiter = await this.userRepository.findOne({
      where: { id: recruiterId, role: UserType.RECRUITER },
      relations: ['portfolioPlayers']
    });
    
    if (!recruiter) {
      throw new NotFoundException('Reclutador no encontrado');
    }
    
    // Verificar que el jugador existe
    const player = await this.userRepository.findOne({
      where: { id: playerId, role: UserType.PLAYER }
    });
    
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    
    // Verificar que el jugador está en la cartera del reclutador
    const isPlayerInPortfolio = recruiter.portfolioPlayers?.some(p => p.id === playerId);
    
    if (!isPlayerInPortfolio) {
      throw new ForbiddenException('El jugador no está en la cartera del reclutador');
    }
    
    // Verificar que el trabajo existe
    const job = await this.jobRepository.findOne({
      where: { id: jobId }
    });
    
    if (!job) {
      throw new NotFoundException('Trabajo no encontrado');
    }
    
    // Verificar si ya existe una aplicación para este jugador y trabajo
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        player: { id: playerId },
        job: { id: jobId }
      }
    });
    
    if (existingApplication) {
      throw new ConflictException('Ya existe una aplicación para este jugador y trabajo');
    }
    
    // Verificar la suscripción del jugador
    try {
      const subscriptionStatus = await this.userService.getUserSubscription(playerId);
      const validSubscriptionType = subscriptionStatus.subscriptionType === 'Semiprofesional' || 
                                   subscriptionStatus.subscriptionType === 'Profesional';
      
      if (!validSubscriptionType) {
        throw new ForbiddenException('El jugador requiere una suscripción activa Semiprofesional o Profesional para aplicar a trabajos');
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error(`Error al verificar suscripción del jugador: ${error.message}`);
      // Si hay un error al verificar la suscripción, continuamos de todas formas ya que el reclutador está aplicando por el jugador
    }
    
    try {
      // Intentar crear la aplicación con los nuevos campos
      const application = this.applicationRepository.create({
        player,
        job,
        message: playerMessage || `Aplicación enviada por mi representante: ${recruiter.name} ${recruiter.lastname}`,
        appliedByRecruiter: true,
        recruiter,
        recruiterMessage
      });
      
      return await this.applicationRepository.save(application);
    } catch (error) {
      console.error('Error al crear aplicación con nuevos campos:', error.message);
      
      // Si falla, crear la aplicación sin los nuevos campos
      // Guardar la información del reclutador en el mensaje
      const message = playerMessage 
        ? `${playerMessage}\n\nAplicación enviada por el representante: ${recruiter.name} ${recruiter.lastname}`
        : `Aplicación enviada por mi representante: ${recruiter.name} ${recruiter.lastname}\n\nMensaje del representante: ${recruiterMessage}`;
      
      // Crear la aplicación básica
      const application = this.applicationRepository.create({
        player,
        job,
        message
      });
      
      const savedApplication = await this.applicationRepository.save(application);
      
      // Enviar notificación al jugador
      try {
        await this.notificationsService.create({
          message: `Tu representante ${recruiter.name} ${recruiter.lastname} te ha postulado a una oferta: "${job.title}"`,
          type: NotificationType.PROFILE_VIEW, // Usamos un tipo existente
          userId: playerId,
          sourceUserId: recruiterId,
          metadata: {
            jobId: jobId,
            jobTitle: job.title,
            applicationId: savedApplication.id,
            isApplicationByRecruiter: true
          }
        });
      } catch (notificationError) {
        console.error('Error al enviar notificación al jugador:', notificationError);
      }
      
      return savedApplication;
    }
  }
}
