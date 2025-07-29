import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { EmailService } from '../Mailing/email.service';
import { ConfigService } from '@nestjs/config';
import { RepresentationRequest } from './entities/representation-request.entity';
import { VerificationRequest } from './entities/verification-request.entity';
import { NotificationsModule } from '../Notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RepresentationRequest, VerificationRequest]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [UserController],
  providers: [UserService, EmailService, ConfigService],
  exports: [UserService, TypeOrmModule]
})
export class UserModule {}
