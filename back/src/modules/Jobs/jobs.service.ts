import { Injectable } from '@nestjs/common';
import { JobRepository } from './jobs.repository';
import { CreateJobDto } from './dto/create-jobs.dto';
import { UpdateJobDto } from './dto/update-jobs.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JobsService {
  constructor(private readonly jobRepository: JobRepository) {}

  createJob(createJobDto: CreateJobDto, recruiter: User) {
    return this.jobRepository.createJob(createJobDto, recruiter);
  }

  getJobs() {
    return this.jobRepository.getJobs();
  }

  getJobById(id: string) {
    return this.jobRepository.getJobById(id);
  }

  updateJob(id: string, updateJobDto: UpdateJobDto, recruiter: User) {
    return this.jobRepository.updateJob(id, updateJobDto, recruiter);
  }

  deleteJob(id: string, recruiter: User) {
    return this.jobRepository.deleteJob(id, recruiter);
  }
}
