import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationController } from './applications.controller';
import { ApplicationService } from './applications.service';
import { Application } from './entities/applications.entity';
import { User } from '../user/entities/user.entity';
import { JobEntity } from '../Jobs/entities/jobs.entity';
import { Contract } from '../contracts/entities/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, User, JobEntity, Contract])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationsModule {}
