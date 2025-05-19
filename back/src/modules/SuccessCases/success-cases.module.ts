import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuccessCase } from './entities/success-case.entity';
import { SuccessCasesController } from './success-cases.controller';
import { SuccessCasesService } from './success-cases.service';

@Module({
  imports: [TypeOrmModule.forFeature([SuccessCase])],
  controllers: [SuccessCasesController],
  providers: [SuccessCasesService],
})
export class SuccessCasesModule {} 