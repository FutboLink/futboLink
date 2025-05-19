import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SuccessCase } from "./entities/success-case.entity";
import { CreateSuccessCaseDto, PublishSuccessCaseDto, UpdateSuccessCaseDto } from "./dto/success-case.dto";

@Injectable()
export class SuccessCasesService {
    constructor(
        @InjectRepository(SuccessCase) 
        private successCaseRepository: Repository<SuccessCase>
    ) {}

    async findAll(): Promise<SuccessCase[]> {
        return this.successCaseRepository.find({
            order: { createdAt: 'DESC' }
        });
    }

    async findPublished(): Promise<SuccessCase[]> {
        return this.successCaseRepository.find({
            where: { isPublished: true },
            order: { createdAt: 'DESC' }
        });
    }

    async findById(id: string): Promise<SuccessCase> {
        const successCase = await this.successCaseRepository.findOne({
            where: { id }
        });
        
        if (!successCase) {
            throw new NotFoundException(`Caso de éxito con ID ${id} no encontrado`);
        }
        
        return successCase;
    }

    async create(createSuccessCaseDto: CreateSuccessCaseDto): Promise<SuccessCase> {
        try {
            const successCase = this.successCaseRepository.create(createSuccessCaseDto);
            return await this.successCaseRepository.save(successCase);
        } catch (error) {
            console.error('Error al crear el caso de éxito:', error);
            throw new Error('No se pudo crear el caso de éxito');
        }
    }

    async update(id: string, updateSuccessCaseDto: UpdateSuccessCaseDto): Promise<SuccessCase> {
        const successCase = await this.findById(id);
        
        // Update only the provided fields
        Object.assign(successCase, updateSuccessCaseDto);
        
        return await this.successCaseRepository.save(successCase);
    }

    async togglePublish(id: string, publishDto: PublishSuccessCaseDto): Promise<SuccessCase> {
        const successCase = await this.findById(id);
        
        successCase.isPublished = publishDto.isPublished;
        
        return await this.successCaseRepository.save(successCase);
    }

    async delete(id: string): Promise<SuccessCase> {
        const successCase = await this.findById(id);
        return await this.successCaseRepository.remove(successCase);
    }
} 