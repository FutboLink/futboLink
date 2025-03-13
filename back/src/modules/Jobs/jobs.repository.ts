import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/jobs.entity';
import { CreateJobDto } from './dto/create-jobs.dto';
import { UpdateJobDto } from './dto/update-jobs.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(Job)
    private readonly repository: Repository<Job>,
  ) {}

  async createJob(createJobDto: CreateJobDto, recruiter: User): Promise<Job> {
    const job = this.repository.create({ ...createJobDto, recruiter });
    return await this.repository.save(job);
  }

  async getJobs(): Promise<Job[]> {
    return await this.repository.find({ where: { status: 'OPEN' }, relations: ['recruiter', 'applications'] });
  }

  async getJobById(id: string): Promise<Job> {
    const job = await this.repository.findOne({
      where: { id },
      relations: ['recruiter', 'applications'],
    });
    if (!job) {
      throw new NotFoundException(`Trabajos con el id ${id} no se encontró`);
    }
    return job;
  }

  async updateJob(
    id: string,
    updateJobDto: UpdateJobDto,
    recruiter: User,
  ): Promise<Job> {
    const job = await this.getJobById(id);
    if (job.recruiter.id !== recruiter.id) {
      throw new UnauthorizedException(
        'Solo puedes actualizar tus propios trabajos',
      );
    }

    Object.assign(job, updateJobDto);
    return await this.repository.save(job);
  }

  async deleteJob(id: string, recruiter: User): Promise<void> {
    const job = await this.getJobById(id);
    if (job.recruiter.id !== recruiter.id) {
      throw new UnauthorizedException(
        'Solo puedes eliminar tus propios trabajos',
      );
    }

    await this.repository.remove(job);
  }
}
