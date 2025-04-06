import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
