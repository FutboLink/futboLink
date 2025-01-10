import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-jobs.dto';
import { UpdateJobDto } from './dto/update-jobs.dto';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from '../../decorator/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo trabajo (solo reclutadores)' })
  @ApiResponse({ status: 201, description: 'Trabajo creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @UseGuards(AuthGuard)
  createJob(@Body() createJobDto: CreateJobDto, @GetUser() user: User) {
    return this.jobsService.createJob(createJobDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de trabajos vacantes' })
  @ApiResponse({ status: 200, description: 'Lista de trabajos' })
  getJobs() {
    return this.jobsService.getJobs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un trabajo específico' })
  @ApiResponse({ status: 200, description: 'Detalles del trabajo' })
  @ApiResponse({ status: 404, description: 'Trabajo no encontrado' })
  getJobById(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un trabajo (solo el creador)' })
  @ApiResponse({ status: 200, description: 'Trabajo actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @UseGuards(AuthGuard)
  updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @GetUser() user: User,
  ) {
    return this.jobsService.updateJob(id, updateJobDto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un trabajo (solo el creador)' })
  @ApiResponse({ status: 200, description: 'Trabajo eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @UseGuards(AuthGuard)
  deleteJob(@Param('id') id: string, @GetUser() user: User) {
    return this.jobsService.deleteJob(id, user);
  }
}


