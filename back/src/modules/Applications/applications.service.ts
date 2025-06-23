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
  async listApplications(jobId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { job: { id: String(jobId) } },
      relations: ['player'],
    });
   
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
}
