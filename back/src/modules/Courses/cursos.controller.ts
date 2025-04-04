import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CursoService } from './cursos.service';
import { CreateCursoDto, UpdateCursoDto } from './dto/createCourses.dto';
import { Curso } from './entities/courses.entity';

@ApiTags('Cursos')
@Controller('cursos')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cursos' })
  findAll(): Promise<Curso[]> {
    return this.cursoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso por ID' })
  findOne(@Param('id') id: string): Promise<Curso> {
    return this.cursoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo curso' })
  create(@Body() dto: CreateCursoDto): Promise<Curso> {
    return this.cursoService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un curso' })
  update(@Param('id') id: string, @Body() dto: UpdateCursoDto): Promise<Curso> {
    return this.cursoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un curso' })
  delete(@Param('id') id: string): Promise<void> {
    return this.cursoService.delete(id);
  }
}
