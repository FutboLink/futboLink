import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/applications.entity';
import { User } from '../user/entities/user.entity';
import { JobEntity } from '../Jobs/entities/jobs.entity';
import { UserType } from '../user/roles.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Applications')
@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
  ) {}

  @ApiOperation({ summary: 'Aplicar a un trabajo' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Jugador o trabajo no encontrado.' })
  @ApiResponse({ status: 409, description: 'Aplicación duplicada.' })
  async apply(playerId: string, jobId: string, message: string): Promise<Application> {
    const player = await this.userRepository.findOne({
      where: { id: String(playerId), role: UserType.PLAYER },
    });
    if (!player) throw new NotFoundException('El usuario no es jugador');

    const job = await this.jobRepository.findOne({ where: { id: String(jobId) } });
    if (!job) throw new NotFoundException('Trabajo no encontrado');

    const existingApplication = await this.applicationRepository.findOne({
      where: {
        player: { id: String(playerId) },
        job: { id: String(jobId) },
      },
    });
    if (existingApplication) throw new ConflictException('Aplicación duplicada');

    const application = this.applicationRepository.create({ player, job, message });
    return this.applicationRepository.save(application);
  }

  @ApiOperation({ summary: 'Listar aplicaciones por trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones encontrada.' })
  async listApplications(jobId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { job: { id: String(jobId) } },
    });
  }

  @ApiOperation({ summary: 'Actualizar estado de una aplicación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Aplicación no encontrada.' })
  async updateStatus(applicationId: string, status: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId } });
    if (!application) throw new NotFoundException('Aplicación no encontrada');

    application.status = status;
    return this.applicationRepository.save(application);
  }
}
