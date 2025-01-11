import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { Application } from '../Applications/entities/applications.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  async createContract(
    createContractDto: CreateContractDto,
  ): Promise<Contract> {
    const application = await this.applicationRepository.findOneBy({
      id: createContractDto.applicationId,
    });

    if (!application) {
      throw new NotFoundException('Postulación no encontrada');
    }

    if (application.status !== 'ACCEPTED') {
      throw new ForbiddenException('La postulación no está en estado ACCEPTED');
    }

    const contract = this.contractRepository.create({
      signedAt: new Date(),
      terms: createContractDto.terms,
      application,
    });

    return this.contractRepository.save(contract);
  }
}
