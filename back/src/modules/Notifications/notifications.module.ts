import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../Mailing/email.service';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { RepresentationRequest } from '../user/entities/representation-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, RepresentationRequest]),
    forwardRef(() => UserModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, ConfigService],
  exports: [NotificationsService],
})
export class NotificationsModule {} 