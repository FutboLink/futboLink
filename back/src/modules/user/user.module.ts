import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../Jobs/entities/jobs.entity';
import { Application } from '../Applications/entities/applications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User /* , Profile */, Job, Application])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
