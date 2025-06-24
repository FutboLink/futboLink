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

    // Enviar email para notificaciones importantes
    if (user.email && (
        notification.type === NotificationType.APPLICATION_SHORTLISTED ||
        notification.type === NotificationType.PROFILE_VIEW
      )) {
      await this.sendNotificationEmail(user, notification, sourceUser);
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
      },
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Enviar email de notificación
    if (viewedUser.email) {
      await this.sendNotificationEmail(viewedUser, savedNotification, viewerUser);
    }

    return savedNotification;
  }

  private async sendNotificationEmail(user: User, notification: Notification, sourceUser?: User): Promise<void> {
    try {
      let subject = '';
      let htmlContent = '';
      const userName = user.name || user.email.split('@')[0];
      const sourceName = sourceUser ? (sourceUser.name || 'Reclutador') : 'FutboLink';

      // Configurar el contenido según el tipo de notificación
      switch (notification.type) {
        case NotificationType.PROFILE_VIEW:
          subject = '¡Un reclutador ha visto tu perfil! - FutboLink';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: #2c3e50; text-align: center;">¡Buenas noticias!</h2>
              <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
                <p>Hola ${userName},</p>
                <p>Queremos informarte que <strong>${sourceName}</strong> ha visto tu perfil en FutboLink.</p>
                <p>Esto significa que tu perfil está generando interés. Te mantendremos informado si hay novedades sobre tu aplicación.</p>
                <p>Recuerda mantener tu perfil actualizado para aumentar tus posibilidades de ser seleccionado.</p>
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
          break;
        
        case NotificationType.APPLICATION_SHORTLISTED:
          subject = '¡Has sido seleccionado para evaluación! - FutboLink';
          
          // Extraer información adicional del metadata si está disponible
          const jobTitle = notification.metadata?.jobTitle || 'una oferta';
          const jobId = notification.metadata?.jobId || '';
          const jobUrl = jobId ? `https://futbolink.vercel.app/jobs/${jobId}` : 'https://futbolink.vercel.app';
          
          htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: #2c3e50; text-align: center;">¡Felicidades!</h2>
              <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
                <p>Hola ${userName},</p>
                <p>Tenemos excelentes noticias para ti: <strong>${sourceName}</strong> ha seleccionado tu perfil para evaluación en la oferta "${jobTitle}".</p>
                <p>Esto significa que tu perfil ha destacado entre los demás candidatos y estás siendo considerado para la posición.</p>
                <p>El reclutador se pondrá en contacto contigo para los siguientes pasos en el proceso de selección.</p>
                <p>Te recomendamos mantener actualizada tu información de contacto y estar atento a futuras comunicaciones.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${jobUrl}" 
                   style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Ver detalles de la oferta
                </a>
              </div>
              
              <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
                <p>FutboLink - Conectando el mundo del fútbol</p>
                <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
              </div>
            </div>
          `;
          break;
          
        default:
          // Para otros tipos de notificaciones, usar un formato genérico
          subject = 'Nueva notificación - FutboLink';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: #2c3e50; text-align: center;">Nueva notificación</h2>
              <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
                <p>Hola ${userName},</p>
                <p>${notification.message}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://futbolink.vercel.app" 
                   style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Ir a FutboLink
                </a>
              </div>
              
              <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
                <p>FutboLink - Conectando el mundo del fútbol</p>
                <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
              </div>
            </div>
          `;
      }

      // Configurar opciones del email
      const mailOptions = {
        from: `"FutboLink" <${process.env.MAIL_FROM || 'notificaciones@futbolink.com'}>`,
        to: user.email,
        subject,
        html: htmlContent
      };

      // Enviar email utilizando el servicio de email
      // Usamos try-catch para evitar que un error en el envío de email afecte el flujo principal
      try {
        await this.emailService.sendEmail(mailOptions);
      } catch (error) {
        console.error(`Error al enviar email de notificación: ${error.message}`);
        // No lanzamos el error para no interrumpir el flujo principal
      }
    } catch (error) {
      console.error(`Error al preparar email de notificación: ${error.message}`);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      relations: ['user', 'sourceUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      relations: ['sourceUser'],
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
} 