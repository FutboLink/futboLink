import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractService } from './contracts.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractService],
})
export class ContractsModule {}
