import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateJobDto } from './dto/create-jobs.dto';
import { Job } from './entities/jobs.entity';
import { Repository, DataSource } from 'typeorm';
import { Application } from '../Applications/entities/applications.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private dataSource: DataSource
  ) {}

  async create(createJobDto: CreateJobDto, recruiterId: string): Promise<Job> {
    // Set default values for required database fields if not provided
    const jobData = {
      ...createJobDto,
      position: createJobDto.position || 'Entrenador', // Default position
      nationality: createJobDto.nationality || 'España', // Default nationality
      extra: createJobDto.extra || ['Sueldo fijo'], // Default extra
      recruiter: { id: recruiterId },
    };
    
    const job = this.jobRepository.create(jobData);
    return await this.jobRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return await this.jobRepository.find({ relations: ['recruiter'] });
  }
  
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id }, relations: ['recruiter'] });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    
    // Ensure compatibility with frontend by adding countries array if it's missing
    if (!job.countries && job.nationality) {
      job.countries = [job.nationality];
    }
    
    return job;
  }
  
  async update(id: string, updateJobDto: Partial<CreateJobDto>): Promise<Job> {
    await this.jobRepository.update(id, updateJobDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // Iniciar una transacción para asegurar la consistencia
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Buscar el trabajo con sus aplicaciones relacionadas
      const job = await this.jobRepository.findOne({ 
        where: { id },
        relations: ['applications'] 
      });
      
      if (!job) {
        throw new NotFoundException(`Job with ID ${id} not found`);
      }
      
      // Eliminar primero todas las aplicaciones asociadas
      if (job.applications && job.applications.length > 0) {
        console.log(`Eliminando ${job.applications.length} aplicaciones relacionadas con el trabajo ${id}`);
        await this.applicationRepository.remove(job.applications);
      }
      
      // Ahora podemos eliminar el trabajo con seguridad
      await this.jobRepository.remove(job);
      
      // Confirmar la transacción
      await queryRunner.commitTransaction();
      console.log(`Trabajo ${id} eliminado correctamente`);
    } catch (error) {
      // Si algo falla, revertir todos los cambios
      await queryRunner.rollbackTransaction();
      console.error(`Error al eliminar trabajo ${id}:`, error);
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }
}