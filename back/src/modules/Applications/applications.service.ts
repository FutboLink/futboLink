import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/applications.entity';
import { User } from '../user/entities/user.entity';
import { Job } from '../Jobs/entities/jobs.entity';
import { UserType } from '../user/roles.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeService } from '../../payments/services/stripe.service';

@ApiTags('Applications')
@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    
    private readonly stripeService: StripeService,
  ) {}

  @ApiOperation({ summary: 'Aplicar a un trabajo' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Jugador o trabajo no encontrado.' })
  @ApiResponse({ status: 409, description: 'Aplicación duplicada.' })
  @ApiResponse({ status: 403, description: 'Se requiere una suscripción activa para aplicar a trabajos.' })
  async apply(playerId: string, jobId: string, message: string): Promise<Application> {
    // Find the player
    const player = await this.userRepository.findOne({
      where: { id: String(playerId), role: UserType.PLAYER },
    });
    if (!player) throw new NotFoundException('El usuario no es jugador');

    console.log(`Verificando suscripción para: ${player.email} (usuario ${playerId})`);
    
    // Check if player has an active subscription
    const subscriptionStatus = await this.stripeService.checkUserSubscription(player.email);
    console.log(`Estado de suscripción: ${JSON.stringify(subscriptionStatus)}`);
    
    // Verificar si el usuario tiene una suscripción Semiprofesional o Profesional
    // Incluso si hasActiveSubscription es false, consideramos el tipo de suscripción
    const validSubscriptionType = subscriptionStatus.subscriptionType === 'Semiprofesional' || 
                                 subscriptionStatus.subscriptionType === 'Profesional';
    
    // MODIFICADO: Permitir aplicar si tiene tipo de suscripción válida, independientemente de hasActiveSubscription
    if (validSubscriptionType) {
      console.log(`Usuario ${player.email} tiene suscripción ${subscriptionStatus.subscriptionType}. Permitiendo aplicar.`);
    } else if (subscriptionStatus.subscriptionType === 'Amateur' || !subscriptionStatus.subscriptionType) {
      console.log(`Suscripción tipo Amateur para ${player.email}, no permitida para aplicar`);
      throw new ForbiddenException('Se requiere una suscripción activa Semiprofesional o Profesional para aplicar a trabajos. Por favor, suscríbete para continuar.');
    } else if (!subscriptionStatus.hasActiveSubscription) {
      console.log(`Suscripción inactiva para ${player.email}`);
      throw new ForbiddenException('Se requiere una suscripción activa para aplicar a trabajos. Por favor, suscríbete para continuar.');
    }

    // Find the job
    const job = await this.jobRepository.findOne({ where: { id: String(jobId) } });
    if (!job) throw new NotFoundException('Trabajo no encontrado');

    // Check for duplicate applications
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        player: { id: String(playerId) },
        job: { id: String(jobId) },
      },
    });
    if (existingApplication) throw new ConflictException('Aplicación duplicada');

    // Create and save the application
    const application = this.applicationRepository.create({ player, job, message });
    return this.applicationRepository.save(application);
  }

  @ApiOperation({ summary: 'Listar aplicaciones por trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones encontrada.' })
  async listApplications(jobId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { job: { id: String(jobId) } },
      relations: ['player'],
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
