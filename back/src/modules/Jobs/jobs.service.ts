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
    return await this.jobRepository.find({
      relations: ['recruiter'],
      select: {
        id: true,
        title: true,
        location: true,
        salary: true,
        description: true,
        contractTypes: true,
        position: true,
        nationality: true,
        imgUrl: true,
        status: true,
        createdAt: true,
        recruiter: {
          id: true,
          name: true,
          lastname: true,
          email: true,
        }
      },
      order: { createdAt: 'DESC' }
    });
  }

  async findByRecruiter(
    recruiterId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Job[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [data, total] = await this.jobRepository.findAndCount({
      where: { recruiter: { id: recruiterId } },
      relations: ['recruiter'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  // Panel del ofertante en UN solo request/UNA sola query SQL: todas las ofertas
  // del recruiter + sus candidatos (postulación + player) con estado. Reemplaza el
  // N+1 del front (getMyOffers + un getJobCandidates por oferta).
  //
  // Eficiencia: un único `getMany()` con 3 LEFT JOINs (job -> applications -> player).
  // NO es N+1 interno: TypeORM agrupa las filas del join y arma las relaciones en
  // memoria. El `.select([...])` limita las columnas (mismo whitelist que
  // `listApplications`) para no traer datos sensibles del player.
  //
  // Shape de respuesta (pensado para consumo directo del front):
  //   {
  //     offers: DashboardJob[],                              // -> setOffers()
  //     candidatesByJob: Record<jobId, DashboardApplication[]> // -> setCandsByJob()
  //   }
  async findMyDashboardWithCandidates(recruiterId: string): Promise<{
    offers: Array<{
      id: string;
      title: string;
      location: string;
      status: string;
      imgUrl: string;
      createdAt: Date;
    }>;
    candidatesByJob: Record<
      string,
      Array<{
        id: string;
        message: string;
        status: string;
        appliedAt: Date;
        shortlistedAt: Date | null;
        appliedByRecruiter: boolean;
        player: {
          id: string;
          name: string;
          lastname: string;
          email: string;
          role: string;
          imgUrl: string;
        } | null;
      }>
    >;
  }> {
    const jobs = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.recruiter', 'recruiter')
      .leftJoin('job.applications', 'application')
      .leftJoin('application.player', 'player')
      .where('recruiter.id = :recruiterId', { recruiterId })
      .select([
        'job.id',
        'job.title',
        'job.location',
        'job.status',
        'job.imgUrl',
        'job.createdAt',
        'application.id',
        'application.message',
        'application.status',
        'application.appliedAt',
        'application.shortlistedAt',
        'application.appliedByRecruiter',
        'player.id',
        'player.name',
        'player.lastname',
        'player.email',
        'player.role',
        'player.imgUrl',
      ])
      .orderBy('job.createdAt', 'DESC')
      .addOrderBy('application.appliedAt', 'DESC')
      .getMany();

    const offers = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      location: job.location,
      status: job.status,
      imgUrl: job.imgUrl,
      createdAt: job.createdAt,
    }));

    const candidatesByJob: Record<
      string,
      Array<{
        id: string;
        message: string;
        status: string;
        appliedAt: Date;
        shortlistedAt: Date | null;
        appliedByRecruiter: boolean;
        player: {
          id: string;
          name: string;
          lastname: string;
          email: string;
          role: string;
          imgUrl: string;
        } | null;
      }>
    > = {};

    for (const job of jobs) {
      candidatesByJob[job.id] = (job.applications ?? []).map((app) => ({
        id: app.id,
        message: app.message,
        status: app.status,
        appliedAt: app.appliedAt,
        shortlistedAt: app.shortlistedAt ?? null,
        appliedByRecruiter: app.appliedByRecruiter,
        player: app.player
          ? {
              id: app.player.id,
              name: app.player.name,
              lastname: app.player.lastname,
              email: app.player.email,
              role: app.player.role,
              imgUrl: app.player.imgUrl,
            }
          : null,
      }));
    }

    return { offers, candidatesByJob };
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