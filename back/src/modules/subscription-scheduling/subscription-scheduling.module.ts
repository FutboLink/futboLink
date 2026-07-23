import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../Mailing/email.service';
import { SubscriptionSchedulingService } from './subscription-scheduling.service';

/**
 * Módulo aislado del ciclo de vida de la suscripción (bloqueo automático +
 * email de renovación, Fase 3/4). Rollback = quitar este import de AppModule.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SubscriptionSchedulingService, EmailService, ConfigService],
  exports: [SubscriptionSchedulingService],
})
export class SubscriptionSchedulingModule {}
