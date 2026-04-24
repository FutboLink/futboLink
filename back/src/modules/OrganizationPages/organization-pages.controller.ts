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
import { AuthGuard } from '../auth/auth.guard';
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

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener una página por slug' })
  findBySlug(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    return this.service.findBySlug(slug, req.user);
  }

  @Get(':id')
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
