import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../Mailing/email.service';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { RepresentationRequest } from '../user/entities/representation-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, RepresentationRequest]),
    UserModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, ConfigService, UserService],
  exports: [NotificationsService],
})
export class NotificationsModule {} 