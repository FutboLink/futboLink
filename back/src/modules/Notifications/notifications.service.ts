import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    return this.notificationsRepository.save(notification);
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

    return this.notificationsRepository.save(notification);
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