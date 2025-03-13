import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobEntity } from './entities/jobs.entity';
import { Application } from '../Applications/entities/applications.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity, Application, User])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
