import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { OrganizationPagesService } from './organization-pages.service';
import { CreateOrganizationPageDto } from './dto/create-organization-page.dto';
import { UpdateOrganizationPageDto } from './dto/update-organization-page.dto';
import { ListOrganizationPagesQueryDto } from './dto/list-organization-pages-query.dto';
import { CheckDuplicatesQueryDto } from './dto/check-duplicates-query.dto';
import { RejectPageDto } from './dto/reject-page.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RequestWithUser } from '../auth/RequestWithUser';

type OptionalAuthRequest = Request & { user?: { id: string; role: string } };

@ApiTags('Organization Pages')
@Controller('organization-pages')
export class OrganizationPagesController {
  constructor(private readonly service: OrganizationPagesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva página de organización' })
  create(@Body() dto: CreateOrganizationPageDto, @Req() req: RequestWithUser) {
    return this.service.create(dto, req.user);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Listar páginas de organización (público)' })
  findAll(
    @Query() query: ListOrganizationPagesQueryDto,
    @Req() req: OptionalAuthRequest,
  ) {
    return this.service.findAll(query, req.user);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar páginas del usuario autenticado' })
  findMine(@Req() req: RequestWithUser) {
    return this.service.findMine(req.user);
  }

  @Get('check-duplicates')
  @ApiOperation({
    summary:
      'Buscar coincidencias por similitud (pg_trgm) para detectar duplicados',
  })
  checkDuplicates(@Query() query: CheckDuplicatesQueryDto) {
    return this.service.checkDuplicates(
      query.name,
      query.type,
      query.country ?? null,
    );
  }

  @Get('admin/pending')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar páginas pendientes de aprobación (admin)' })
  findPending(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findPending(
      req.user,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar una página pendiente (admin)' })
  approve(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.approve(id, req.user);
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar una página pendiente (admin)' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectPageDto,
    @Req() req: RequestWithUser,
  ) {
    return this.service.reject(id, req.user, dto.reason);
  }

  @Post(':id/republish')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Reenviar una página rechazada al flujo (owner o admin). Re-corre la detección de duplicados.',
  })
  republish(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.republish(id, req.user);
  }

  @Get('slug/:slug')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Obtener una página por slug' })
  findBySlug(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    return this.service.findBySlug(slug, req.user);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Obtener una página por ID' })
  findOne(@Param('id') id: string, @Req() req: OptionalAuthRequest) {
    return this.service.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una página (owner o admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationPageDto,
    @Req() req: RequestWithUser,
  ) {
    return this.service.update(id, dto, req.user);
  }

  @Post(':id/deactivate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar una página (solo admin)' })
  deactivate(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.deactivate(id, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una página (solo admin)' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.hardDelete(id, req.user);
  }
}
