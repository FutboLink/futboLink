import { Injectable } from '@nestjs/common';
import { ApplicationRepository } from './applications.repository';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
  ) {}

  async apply(playerId: string, jobid: string, message: string) {
    return this.applicationRepository.apply(playerId, jobid, message);
  }

  async listApplications(jobId: string) {
    return this.applicationRepository.listApplications(jobId);
  }

  async updateStatus(applicationId: string, status: string) {
    return this.applicationRepository.updateStatus(applicationId, status);
  }
}
