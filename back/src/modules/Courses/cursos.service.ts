import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/courses.entity';
import { CreateCursoDto, UpdateCursoDto } from './dto/createCourses.dto';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  async findAll(): Promise<Curso[]> {
    return this.cursoRepository.find();
  }

  async findOne(id: string): Promise<Curso> {
    const curso = await this.cursoRepository.findOne({ where: { id } });
    if (!curso) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }
    return curso;
  }

  async create(dto: CreateCursoDto): Promise<Curso> {
    const curso = this.cursoRepository.create(dto);
    return this.cursoRepository.save(curso);
  }

  async update(id: string, dto: UpdateCursoDto): Promise<Curso> {
    await this.findOne(id);
    await this.cursoRepository.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.cursoRepository.delete(id);
  }
}