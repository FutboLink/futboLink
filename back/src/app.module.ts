import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeormConfig from './modules/config/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JobsModule } from './modules/Jobs/jobs.module';
import { ApplicationsModule } from './modules/Applications/applications.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { NewsModule } from './modules/News/news.module';
import { CursoModule } from './modules/Courses/cursos.module';
import { PaymentsModule } from './payments/payments.module';
import { SuccessCasesModule } from './modules/SuccessCases/success-cases.module';
import { ContactModule } from './modules/Contact/contact.module';
import { NotificationsModule } from './modules/Notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm'),
    }),
    UserModule,
    AuthModule,
    JobsModule,
    ApplicationsModule,
    ContractsModule,
    NewsModule,
    CursoModule,
    PaymentsModule,
    SuccessCasesModule,
    ContactModule,
    NotificationsModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
