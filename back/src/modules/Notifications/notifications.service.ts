import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../Mailing/email.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

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

    // Enviar email según el tipo de notificación
    if (user.email) {
      if (notification.type === NotificationType.APPLICATION_SHORTLISTED) {
        await this.sendShortlistedEmail(
          user.email, 
          user.name || 'Usuario',
          notification.message,
          notification.metadata
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

    // Enviar email de notificación
    if (viewedUser.email) {
      await this.sendProfileViewEmail(
        viewedUser.email,
        viewedUser.name || 'Usuario',
        viewerUser.name || 'Reclutador',
        viewerUser.nameAgency || 'Empresa'
      );
    }

    return savedNotification;
  }

  // Método para enviar email cuando un perfil es visto
  private async sendProfileViewEmail(email: string, userName: string, recruiterName: string, companyName: string) {
    try {
      const subject = 'Tu perfil ha sido visto en FutboLink';
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center;">¡Buenas noticias!</h2>
          
          <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
            <p>Hola ${userName},</p>
            <p>Nos complace informarte que <strong>${recruiterName}</strong> de <strong>${companyName}</strong> ha visto tu perfil en FutboLink.</p>
            <p>Esto significa que tu perfil está generando interés. Te notificaremos si eres seleccionado para avanzar en el proceso.</p>
            <p>Te recomendamos mantener tu perfil actualizado para maximizar tus oportunidades.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://futbolink.vercel.app/profile" 
               style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Ver mi perfil
            </a>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
            <p>FutboLink - Conectando el mundo del fútbol</p>
            <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      // Crear un método personalizado en EmailService para enviar emails genéricos
      await this.sendEmail(email, subject, html);
      return true;
    } catch (error) {
      console.error(`Error sending profile view email: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
      return false;
    }
  }

  // Método para enviar email cuando un candidato es seleccionado
  private async sendShortlistedEmail(email: string, userName: string, message: string, metadata: any) {
    try {
      const jobTitle = metadata?.jobTitle || 'Oferta de trabajo';
      const jobId = metadata?.jobId || '';
      
      const subject = '¡Has sido seleccionado para evaluación en FutboLink!';
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center;">¡Felicidades!</h2>
          
          <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
            <p>Hola ${userName},</p>
            <p>Nos complace informarte que <strong>has sido seleccionado para evaluación</strong> en la oferta "${jobTitle}".</p>
            <p>Tu perfil ha llamado la atención del reclutador y ahora estás en la lista de candidatos seleccionados para continuar en el proceso.</p>
            <p>El reclutador podría contactarte próximamente para los siguientes pasos. Te recomendamos mantener tu información de contacto actualizada.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://futbolink.vercel.app/jobs/${jobId}" 
               style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Ver oferta
            </a>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
            <p>FutboLink - Conectando el mundo del fútbol</p>
            <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      await this.sendEmail(email, subject, html);
      return true;
    } catch (error) {
      console.error(`Error sending shortlisted email: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
      return false;
    }
  }

  // Método auxiliar para enviar emails
  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const nodemailer = require('nodemailer');
      
      // Crear un transporter temporal usando la configuración del servicio de email
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      
      // Enviar el email
      await transporter.sendMail({
        from: `"FutboLink" <${process.env.MAIL_FROM || 'futbolink.contacto@gmail.com'}>`,
        to,
        subject,
        html,
      });
      
      return true;
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
      return false;
    }
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
        metadata: true,
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
        metadata: true,
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
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center;">Nueva Solicitud de Representación</h2>
          
          <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
            <p>Hola ${playerName},</p>
            <p><strong>${recruiterName}</strong> de <strong>${recruiterAgency}</strong> está interesado en representarte como agente.</p>
            <p>Mensaje del reclutador:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60;">
              <p>${message}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://futbolink.vercel.app/PanelUsers/Player" 
               style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Responder a la solicitud
            </a>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
            <p>FutboLink - Conectando el mundo del fútbol</p>
            <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      await this.sendEmail(email, subject, html);
      return true;
    } catch (error) {
      console.error(`Error sending representation request email: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
      return false;
    }
  }
} 