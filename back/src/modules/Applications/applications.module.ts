import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationController } from './applications.controller';
import { ApplicationService } from './applications.service';
import { Application } from './entities/applications.entity';
import { User } from '../user/entities/user.entity';
import { Job } from '../Jobs/entities/jobs.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { PaymentsModule } from '../../payments/payments.module';
import { StripeService } from '../../payments/services/stripe.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { NotificationsModule } from '../Notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, Job, Contract]), 
    PaymentsModule,
    UserModule,
    NotificationsModule
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationsModule {}
