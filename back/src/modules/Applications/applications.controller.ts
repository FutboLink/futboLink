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
import { ApplicationsService } from './applications.service';
import { CreateApplicationsDto } from './dto/applications.dto';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva aplicación' })
  @ApiResponse({ status: 201, description: 'Aplicación creada exitosamente' })
  async apply(@Body() createApplicationsDto: CreateApplicationsDto) {
    const { jobId, userId, message } = createApplicationsDto;
    const playerId = userId;
    const jobid = jobId;
    console.log(playerId);

    console.log(jobId);

    return this.applicationsService.apply(playerId, jobid, message);
  }

  @Get('/jobs/:id')
  @ApiOperation({ summary: 'Listar aplicaciones de un trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones' })
  async listApplications(@Param('id', ParseIntPipe) jobId: string) {
    return this.applicationsService.listApplications(jobId);
  }

  @Patch('/:id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una aplicación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  async updateStatus(
    @Param('id', ParseIntPipe) applicationId: string,
    @Body('status') status: string,
  ) {
    return this.applicationsService.updateStatus(applicationId, status);
  }
}
