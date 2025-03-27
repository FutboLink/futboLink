import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursoService } from './cursos.service';
import { CursoController } from './cursos.controller';
import { Curso } from './entities/courses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curso])],
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService],
})
export class CursoModule {}