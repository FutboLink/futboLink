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
import { MailerModule } from '@nestjs-modules/mailer';
import { PaymentsModule } from './payments/payments.module';
import { mailConfig } from './modules/config/mail.config';
import { EmailController } from './modules/Mailing/email.controller';
import { EmailService } from './modules/Mailing/email.service';

@Module({
  imports: [
    MailerModule.forRoot(mailConfig),
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
    PaymentsModule
   
  ],
  
  controllers: [AppController,EmailController],
  providers: [AppService, EmailService],
})
export class AppModule {}
