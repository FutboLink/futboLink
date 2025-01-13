import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/applications.entity';
import { User } from '../user/entities/user.entity';
import { Job } from '../Jobs/entities/jobs.entity';
import { ApplicationRepository } from './applications.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Application, User, Job])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationRepository],
})
export class ApplicationsModule {}
