import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateJobDto } from './dto/create-jobs.dto';
import { AuthGuard } from '../auth/auth.guard';
import {Request} from "express"
import { RequestWithUser } from '../auth/RequestWithUser';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Crear un nuevo trabajo' })
  async create(@Body() createJobDto: CreateJobDto, @Req() req: RequestWithUser) {
    const recruiterId = req.user.id;
    return this.jobsService.create(createJobDto, recruiterId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los trabajos' })
  async findAll() {
    return this.jobsService.findAll();
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener las ofertas publicadas por el reclutador autenticado (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Tamaño de página (default 10, max 50)' })
  async findMine(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page !== undefined ? Number(page) : 1;
    const parsedLimit = limit !== undefined ? Number(limit) : 10;

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      throw new BadRequestException('limit must be an integer between 1 and 50');
    }

    return this.jobsService.findByRecruiter(req.user.id, parsedPage, parsedLimit);
  }

  @Get('my/with-candidates')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Panel del ofertante en un solo request: ofertas del recruiter + sus candidatos (postulacion + player) con estado',
  })
  async findMyDashboardWithCandidates(@Req() req: RequestWithUser) {
    return this.jobsService.findMyDashboardWithCandidates(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un trabajo por ID' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un trabajo' })
  async update(@Param('id') id: string, @Body() updateJobDto: Partial<CreateJobDto>) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un trabajo' })
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
