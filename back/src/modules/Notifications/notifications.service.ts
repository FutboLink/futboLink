import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../Mailing/email.service';
import { renderEmailLayout } from '../Mailing/email-template';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /** URL base del front, sin trailing slash. Fallback al dominio productivo. */
  private getFrontendUrl(): string {
    const raw =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://futbolink.vercel.app';
    return raw.replace(/\/+$/, '');
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Verificar que el usuario existe
    const user = await this.usersRepository.findOne({ 
      where: { id: createNotificationDto.userId } 
    });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${createNotificationDto.userId} no encontrado`);
    }

    // Verificar que el usuario fuente existe (si se proporciona)
    let sourceUser = null;
    if (createNotificationDto.sourceUserId) {
      sourceUser = await this.usersRepository.findOne({ 
        where: { id: createNotificationDto.sourceUserId } 
      });
      
      if (!sourceUser) {
        throw new NotFoundException(`Usuario fuente con ID ${createNotificationDto.sourceUserId} no encontrado`);
      }
    }

    // Crear la notificación
    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      user,
      sourceUser,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Enviar email SOLO para los eventos importantes (para no agotar la cuota
    // de Resend). El resto de notificaciones quedan solo in-app.
    if (user.email) {
      if (notification.type === NotificationType.APPLICATION_SHORTLISTED) {
        await this.sendShortlistedEmail(
          user.email,
          user.name || 'Usuario',
          notification.message,
          notification.metadata
        );
      } else if (notification.type === NotificationType.APPLICATION_INTEREST) {
        await this.sendInterestEmail(
          user.email,
          user.name || 'Usuario',
          notification.metadata,
        );
      }
    }

    return savedNotification;
  }

  async createProfileViewNotification(viewedUserId: string, viewerUserId: string): Promise<Notification> {
    // Verificar que ambos usuarios existen
    const [viewedUser, viewerUser] = await Promise.all([
      this.usersRepository.findOne({ where: { id: viewedUserId } }),
      this.usersRepository.findOne({ where: { id: viewerUserId } }),
    ]);

    if (!viewedUser) {
      throw new NotFoundException(`Usuario con ID ${viewedUserId} no encontrado`);
    }

    if (!viewerUser) {
      throw new NotFoundException(`Usuario con ID ${viewerUserId} no encontrado`);
    }

    // Crear mensaje personalizado
    const message = `Un reclutador ha visto tu solicitud e ingreso a tu perfil, te notificaremos si eres seleccionado`;

    // Crear la notificación
    const notification = this.notificationsRepository.create({
      message,
      type: NotificationType.PROFILE_VIEW,
      user: viewedUser,
      userId: viewedUserId,
      sourceUser: viewerUser,
      sourceUserId: viewerUserId,
      metadata: {
        viewerRole: viewerUser.role,
        viewerName: viewerUser.name || 'Reclutador',
        viewerLastname: viewerUser.lastname || '',
        jobTitle: viewerUser.nameAgency || 'Oferta de trabajo'
      },
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // La notificación de vista de perfil queda solo in-app: NO se envía email
    // (evento de alto volumen que agotaba la cuota gratuita de Resend).

    return savedNotification;
  }

  // Método para enviar email cuando un candidato es seleccionado
  private async sendShortlistedEmail(email: string, userName: string, message: string, metadata: any) {
    try {
      const jobTitle = metadata?.jobTitle || 'Oferta de trabajo';
      const jobId = metadata?.jobId || '';

      const subject = '¡Has sido seleccionado para evaluación en FutboLink!';
      const html = renderEmailLayout({
        title: '¡Felicidades!',
        preheader: `Fuiste seleccionado para evaluación en "${jobTitle}".`,
        paragraphs: [
          `Hola ${userName},`,
          `Nos complace informarte que <strong>has sido seleccionado para evaluación</strong> en la oferta "${jobTitle}".`,
          'Tu perfil ha llamado la atención del reclutador y ahora estás en la lista de candidatos seleccionados para continuar en el proceso.',
          'El reclutador podría contactarte próximamente para los siguientes pasos. Te recomendamos mantener tu información de contacto actualizada.',
        ],
        cta: {
          label: 'Ver oferta',
          url: `${this.getFrontendUrl()}/jobs/${jobId}`,
        },
      });

      await this.sendEmail(email, subject, html);
      return true;
    } catch (error) {
      console.error(`Error sending shortlisted email: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
      return false;
    }
  }

  // Método para enviar email cuando el ofertante marca "interés" en el candidato
  private async sendInterestEmail(email: string, userName: string, metadata: any) {
    try {
      const jobTitle = metadata?.jobTitle || 'una de sus ofertas';
      const jobId = metadata?.jobId || '';

      const subject = 'Mostraron interés en tu perfil en FutboLink';
      const cta = jobId
        ? { label: 'Ver oferta', url: `${this.getFrontendUrl()}/jobs/${jobId}` }
        : { label: 'Ir a mi cuenta', url: `${this.getFrontendUrl()}/PanelUsers/Player` };

      const html = renderEmailLayout({
        title: '¡Buenas noticias!',
        preheader: `Un club o reclutador mostró interés en tu perfil para "${jobTitle}".`,
        paragraphs: [
          `Hola ${userName},`,
          `Un club o reclutador <strong>mostró interés en tu perfil</strong> para la oferta "${jobTitle}".`,
          'Esto significa que tu candidatura avanzó y estás más cerca de la siguiente etapa del proceso.',
          'Te recomendamos mantener tu perfil y tus datos de contacto actualizados para no perder esta oportunidad.',
        ],
        cta,
      });

      await this.sendEmail(email, subject, html);
      return true;
    } catch (error) {
      console.error(`Error sending interest email: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
      return false;
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    return this.emailService.sendHtmlEmail(to, subject, html);
  }

  async findAll(limit: number = 100): Promise<Notification[]> {
    // Optimizado: Límite y select específico para reducir memoria
    return this.notificationsRepository.find({
      relations: ['user', 'sourceUser'],
      select: {
        id: true,
        message: true,
        type: true,
        read: true,
        userId: true,
        sourceUserId: true,
        createdAt: true,
        metadata: true as any,
        user: {
          id: true,
          name: true,
          lastname: true,
        },
        sourceUser: {
          id: true,
          name: true,
          lastname: true,
          imgUrl: true,
        }
      },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    // Optimizado: Límite por defecto y select específico
    return this.notificationsRepository.find({
      where: { userId },
      relations: ['sourceUser'],
      select: {
        id: true,
        message: true,
        type: true,
        read: true,
        userId: true,
        sourceUserId: true,
        createdAt: true,
        metadata: true as any,
        sourceUser: {
          id: true,
          name: true,
          lastname: true,
          imgUrl: true,
        }
      },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user', 'sourceUser'],
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    
    Object.assign(notification, updateNotificationDto);
    
    return this.notificationsRepository.save(notification);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, read: false },
      { read: true }
    );
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, read: false },
    });
  }

  async createRepresentationRequestNotification(
    playerId: string, 
    recruiterId: string, 
    requestId: string,
    message?: string
  ): Promise<Notification> {
    // Verificar que ambos usuarios existen
    const [player, recruiter] = await Promise.all([
      this.usersRepository.findOne({ where: { id: playerId } }),
      this.usersRepository.findOne({ where: { id: recruiterId } }),
    ]);

    if (!player) {
      throw new NotFoundException(`Usuario con ID ${playerId} no encontrado`);
    }

    if (!recruiter) {
      throw new NotFoundException(`Usuario con ID ${recruiterId} no encontrado`);
    }

    // Crear mensaje personalizado si no se proporciona uno
    const notificationMessage = message || `${recruiter.name} ${recruiter.lastname} quiere representarte como agente`;

    // Crear la notificación
    const notification = this.notificationsRepository.create({
      message: notificationMessage,
      type: NotificationType.REPRESENTATION_REQUEST,
      user: player,
      userId: playerId,
      sourceUser: recruiter,
      sourceUserId: recruiterId,
      metadata: {
        requestId,
        recruiterName: `${recruiter.name} ${recruiter.lastname}`,
        recruiterAgency: recruiter.nameAgency || '',
      },
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Enviar email de notificación
    if (player.email) {
      await this.sendRepresentationRequestEmail(
        player.email,
        player.name || 'Jugador',
        `${recruiter.name} ${recruiter.lastname}`,
        recruiter.nameAgency || 'Agente independiente',
        requestId,
        message || 'Me gustaría representarte como agente'
      );
    }

    return savedNotification;
  }

  // Método para enviar email cuando se recibe una solicitud de representación
  private async sendRepresentationRequestEmail(
    email: string, 
    playerName: string, 
    recruiterName: string, 
    recruiterAgency: string,
    requestId: string,
    message: string
  ) {
    try {
      const subject = 'Nueva solicitud de representación en FutboLink';
      const html = renderEmailLayout({
        title: 'Nueva Solicitud de Representación',
        preheader: `${recruiterName} quiere representarte como agente.`,
        bodyHtml: `
          <p>Hola ${playerName},</p>
          <p><strong>${recruiterName}</strong> de <strong>${recruiterAgency}</strong> está interesado en representarte como agente.</p>
          <p>Mensaje del reclutador:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60;">
            <p>${message}</p>
          </div>`,
        cta: {
          label: 'Responder a la solicitud',
          url: 'https://futbolink.vercel.app/PanelUsers/Player',
        },
      });

      await this.sendEmail(email, subject, html);
      return true;
    } catch (error) {
      console.error(`Error sending representation request email: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
      return false;
    }
  }
} 