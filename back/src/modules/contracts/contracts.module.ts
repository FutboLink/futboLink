import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractService } from './contracts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../Applications/entities/applications.entity';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Application])],
  controllers: [ContractsController],
  providers: [ContractService],
})
export class ContractsModule {}
