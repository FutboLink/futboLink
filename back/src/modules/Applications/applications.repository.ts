import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Application } from './entities/applications.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Job } from '../Jobs/entities/jobs.entity';
import { UserType } from '../user/roles.enum';

@Injectable()
export class ApplicationRepository {
  constructor(
    @InjectRepository(Application)
    private readonly repository: Repository<Application>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async apply(playerId: string, jobid: string, message: string): Promise<Application> {
    const player = await this.userRepository.findOne({
      where: { id: String(playerId), role: UserType.PLAYER },
    });
    if (!player) throw new Error('El usuario no es jugador');


    const job = await this.jobRepository.findOne({
      where: { id: String(jobid) },
    });
    if (!job) throw new Error('Trabajo no encontrado');


    const existingApplication = await this.repository.findOne({
      where: {
        player: { id: String(playerId) },
        job: { id: String(jobid) },
      },
    });
    if (existingApplication) throw new Error('Aplicación duplicada');

    const application = this.repository.create({ player, job, message });
    return this.repository.save(application);
  }

  async listApplications(jobId: string): Promise<Application[]> {
    return this.repository.find({
      where: { job: { id: String(jobId) } },
    });
  }

  async updateStatus(applicationId: string, status: string): Promise<Application> {
    const application = await this.repository.findOne({ where: { id: applicationId } });
    if (!application) throw new Error('Aplicación no encontrada');

    application.status = status;
    return this.repository.save(application);
  }
}


