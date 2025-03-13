import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CreateApplicationsDto } from './dto/applications.dto';
import { ApplicationService } from './applications.service';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva aplicación' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente' })
  async apply(@Body() createApplicationsDto: CreateApplicationsDto) {
    const { jobId, userId, message } = createApplicationsDto;
    const playerId = userId;
    const jobid = jobId;
    console.log(playerId);

    console.log(jobId);

    return this.applicationService.apply(playerId, jobid, message);
  }

  @Get('/jobs/:id')
  @ApiOperation({ summary: 'Listar aplicaciones de un trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones' })
  async listApplications(@Param('id') jobId: string) {
    return this.applicationService.listApplications(jobId);
  }

  @Patch('/:id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una aplicación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  async updateStatus(
    @Param('id') applicationId: string,
    @Body('status') status: string,
  ) {
    return this.applicationService.updateStatus(applicationId, status);
  }
}
