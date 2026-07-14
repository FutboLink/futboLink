import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  // Escalera de una sola dirección del panel. Los estados legacy
  // (SHORTLISTED/ACCEPTED/REJECTED) NO están en la escalera: los autoavances no
  // los tocan para no pisar data existente.
  private readonly LADDER: string[] = [
    ApplicationStatus.PENDING,
    ApplicationStatus.IN_REVIEW,
    ApplicationStatus.PROFILE_VIEWED,
    ApplicationStatus.INTERESTED,
  ];

  // Estados de la escalera anteriores a `next` (los únicos desde los que se puede
  // promover). Ej: promotableFrom(INTERESTED) -> [PENDING, IN_REVIEW, PROFILE_VIEWED].
  private promotableFrom(next: ApplicationStatus): string[] {
    return this.LADDER.slice(0, this.LADDER.indexOf(next));
  }

  // Promoción ATÓMICA a `next`: un único UPDATE condicional. Solo cambia la fila
  // si su estado actual está más atrás en la escalera. Ante requests concurrentes
  // el lock de fila garantiza que gane UNO solo (el resto ve affected === 0), lo
  // que mata los races de doble notificación/email. Devuelve las filas afectadas.
  private async promote(
    applicationId: string,
    next: ApplicationStatus,
  ): Promise<number> {
    const from = this.promotableFrom(next);
    if (from.length === 0) return 0;
    const result = await this.applicationRepository.update(
      { id: String(applicationId), status: In(from) },
      { status: next },
    );
    return result.affected ?? 0;
  }

  // Crea una notificación sin romper el flujo si falla (best-effort).
  private async safeNotify(payload: {
    message: string;
    type: NotificationType;
    userId: string;
    sourceUserId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.notificationsService.create(payload as any);
    } catch (error) {
      console.error('Error al enviar notificación:', error?.message || error);
    }
  }

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
    const saved = await this.applicationRepository.save(application);

    // Confirmación al jugador de que su postulación se envió.
    await this.safeNotify({
      message: `Tu perfil fue enviado correctamente a la oferta "${job.title}". Te notificaremos sobre el proceso.`,
      type: NotificationType.APPLICATION_SENT,
      userId: player.id,
      sourceUserId: job.recruiter?.id,
      metadata: { jobId: job.id, jobTitle: job.title, jobImgUrl: job.imgUrl, applicationId: saved.id },
    });

    // Aviso al ofertante (dueño de la oferta) de que llegó una nueva postulación.
    if (job.recruiter) {
      await this.safeNotify({
        message: `${player.name}${player.lastname ? ' ' + player.lastname : ''} se postuló a tu oferta "${job.title}".`,
        type: NotificationType.APPLICATION_RECEIVED,
        userId: job.recruiter.id,
        sourceUserId: player.id,
        metadata: { jobId: job.id, jobTitle: job.title, jobImgUrl: job.imgUrl, applicationId: saved.id },
      });
    }

    return saved;
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
  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    ownerId: string,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['player', 'job', 'job.recruiter'],
    });
    if (!application) throw new NotFoundException('Aplicación no encontrada');

    // Solo el dueño de la oferta puede cambiar el estado de una postulación.
    if (application.job?.recruiter?.id !== ownerId) {
      throw new ForbiddenException('No sos el dueño de esta oferta');
    }

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
    // Verificar que el reclutador o agencia existe
    const recruiter = await this.userRepository.findOne({
      where: { id: recruiterId, role: In([UserType.RECRUITER, UserType.AGENCY]) },
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

  @ApiOperation({ summary: 'Listar las postulaciones de un jugador (panel)' })
  @ApiResponse({ status: 200, description: 'Postulaciones del jugador con su estado.' })
  async findByPlayer(playerId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { player: { id: String(playerId) } },
      relations: ['job', 'job.recruiter'],
      order: { appliedAt: 'DESC' },
    });
  }

  // Postulaciones que un reclutador/agente hizo en nombre de jugadores de su
  // cartera (panel del Agente -> "Mis postulaciones").
  async findByRecruiter(recruiterId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { recruiter: { id: String(recruiterId) }, appliedByRecruiter: true },
      relations: ['job', 'job.recruiter', 'player'],
      order: { appliedAt: 'DESC' },
    });
  }

  // Cuando el ofertante entra a ver los candidatos de su oferta, todas las
  // postulaciones PENDING pasan a IN_REVIEW ("En revisión") y se avisa al jugador.
  async markJobInReview(jobId: string, ownerId: string): Promise<{ updated: number }> {
    const job = await this.jobRepository.findOne({
      where: { id: String(jobId) },
      relations: ['recruiter'],
    });
    if (!job) throw new NotFoundException('Oferta no encontrada');
    if (job.recruiter?.id !== ownerId) {
      throw new ForbiddenException('No sos el dueño de esta oferta');
    }

    const apps = await this.applicationRepository.find({
      where: { job: { id: String(jobId) } },
      relations: ['player'],
    });

    let updated = 0;
    for (const app of apps) {
      // Promoción atómica: si ya está IN_REVIEW (o más adelante) affected === 0,
      // así re-expandir el acordeón NO vuelve a notificar (idempotente).
      const affected = await this.promote(app.id, ApplicationStatus.IN_REVIEW);
      if (affected !== 1) continue;
      updated++;
      if (app.player) {
        await this.safeNotify({
          message: `Tu postulación a "${job.title}" está en revisión.`,
          type: NotificationType.APPLICATION_IN_REVIEW,
          userId: app.player.id,
          sourceUserId: ownerId,
          metadata: { jobId: job.id, jobTitle: job.title, jobImgUrl: job.imgUrl, applicationId: app.id },
        });
      }
    }
    return { updated };
  }

  // Cuando el ofertante abre el perfil de un candidato -> PROFILE_VIEWED.
  async markProfileViewed(applicationId: string, ownerId: string): Promise<Application> {
    const app = await this.applicationRepository.findOne({
      where: { id: String(applicationId) },
      relations: ['player', 'job', 'job.recruiter'],
    });
    if (!app) throw new NotFoundException('Postulación no encontrada');
    if (app.job?.recruiter?.id !== ownerId) {
      throw new ForbiddenException('No sos el dueño de esta oferta');
    }
    // Promoción atómica: si otra request (ej. el bulk markProfileViewedByViewedUser)
    // ya la avanzó, affected === 0 y NO volvemos a notificar → una sola notif por
    // transición real.
    const affected = await this.promote(app.id, ApplicationStatus.PROFILE_VIEWED);
    if (affected === 1) {
      app.status = ApplicationStatus.PROFILE_VIEWED;
      if (app.player) {
        await this.safeNotify({
          message: `Vieron tu perfil en la oferta "${app.job.title}".`,
          type: NotificationType.APPLICATION_PROFILE_VIEWED,
          userId: app.player.id,
          sourceUserId: ownerId,
          metadata: { jobId: app.job.id, jobTitle: app.job.title, jobImgUrl: app.job.imgUrl, applicationId: app.id },
        });
      }
    }
    return app;
  }

  // Cuando un ofertante ABRE el perfil de un usuario (link directo, nueva
  // pestaña, clic central, "Ver postulantes", etc.) marcamos PROFILE_VIEWED en
  // TODAS las postulaciones de ese usuario a ofertas cuyo dueño sea el viewer.
  // Idempotente y tolerante: si el viewer no es su propio perfil, no es dueño de
  // ninguna oferta a la que el usuario se postuló, o todas ya están más adelante
  // en la escalera, devuelve { updated: 0 } sin tocar nada (no 403/500).
  async markProfileViewedByViewedUser(
    viewedUserId: string,
    viewerId: string,
  ): Promise<{ updated: number }> {
    if (!viewedUserId || !viewerId || viewedUserId === viewerId) {
      return { updated: 0 };
    }

    const apps = await this.applicationRepository.find({
      where: {
        player: { id: String(viewedUserId) },
        job: { recruiter: { id: String(viewerId) } },
      },
      relations: ['player', 'job', 'job.recruiter'],
    });

    let updated = 0;
    for (const app of apps) {
      // Promoción atómica: idempotente frente al markProfileViewed puntual de la
      // misma app (BUG 7) → la notif de perfil visto se emite una sola vez.
      const affected = await this.promote(app.id, ApplicationStatus.PROFILE_VIEWED);
      if (affected !== 1) continue;
      updated++;
      if (app.player) {
        await this.safeNotify({
          message: `Vieron tu perfil en la oferta "${app.job.title}".`,
          type: NotificationType.APPLICATION_PROFILE_VIEWED,
          userId: app.player.id,
          sourceUserId: viewerId,
          metadata: { jobId: app.job.id, jobTitle: app.job.title, jobImgUrl: app.job.imgUrl, applicationId: app.id },
        });
      }
    }
    return { updated };
  }

  // Botón "Me interesa" del ofertante -> INTERESTED (acción explícita).
  async markInterest(applicationId: string, ownerId: string): Promise<Application> {
    const app = await this.applicationRepository.findOne({
      where: { id: String(applicationId) },
      relations: ['player', 'job', 'job.recruiter'],
    });
    if (!app) throw new NotFoundException('Postulación no encontrada');
    if (app.job?.recruiter?.id !== ownerId) {
      throw new ForbiddenException('No sos el dueño de esta oferta');
    }
    // Promoción atómica respetando la escalera (BUG 4: antes usaba `!== INTERESTED`,
    // que dejaba saltar desde estados legacy REJECTED/SHORTLISTED/ACCEPTED). Con el
    // UPDATE condicional solo promueve desde PENDING/IN_REVIEW/PROFILE_VIEWED y, ante
    // requests concurrentes, gana uno solo → una sola notif + un solo email (BUG 2).
    const affected = await this.promote(app.id, ApplicationStatus.INTERESTED);
    if (affected === 1) {
      app.status = ApplicationStatus.INTERESTED;
      if (app.player) {
        await this.safeNotify({
          message: `Mostraron interés en tu perfil para la oferta "${app.job.title}".`,
          type: NotificationType.APPLICATION_INTEREST,
          userId: app.player.id,
          sourceUserId: ownerId,
          metadata: { jobId: app.job.id, jobTitle: app.job.title, jobImgUrl: app.job.imgUrl, applicationId: app.id },
        });
      }
    }
    return app;
  }
}
