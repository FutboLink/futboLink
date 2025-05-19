import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SuccessCasesService } from "./success-cases.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateSuccessCaseDto, PublishSuccessCaseDto, UpdateSuccessCaseDto } from "./dto/success-case.dto";

@ApiTags('Success Cases')
@Controller('success-cases')
export class SuccessCasesController {
    constructor(private successCasesService: SuccessCasesService) {}

    // Public endpoints
    @Get()
    @ApiOperation({ summary: 'Obtener todos los casos de éxito' })
    @ApiResponse({ status: 200, description: 'Lista de todos los casos de éxito' })
    getAllSuccessCases() {
        return this.successCasesService.findAll();
    }

    @Get('published')
    @ApiOperation({ summary: 'Obtener casos de éxito publicados' })
    @ApiResponse({ status: 200, description: 'Lista de casos de éxito publicados' })
    getPublishedSuccessCases() {
        return this.successCasesService.findPublished();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un caso de éxito por ID' })
    @ApiResponse({ status: 200, description: 'Caso de éxito' })
    @ApiResponse({ status: 404, description: 'Caso de éxito no encontrado' })
    getSuccessCaseById(@Param('id') id: string) {
        return this.successCasesService.findById(id);
    }

    // Protected endpoints (require authentication)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear un nuevo caso de éxito' })
    @ApiResponse({ status: 201, description: 'Caso de éxito creado exitosamente' })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @UseGuards(AuthGuard)
    createSuccessCase(@Body() createSuccessCaseDto: CreateSuccessCaseDto) {
        return this.successCasesService.create(createSuccessCaseDto);
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar un caso de éxito' })
    @ApiResponse({ status: 200, description: 'Caso de éxito actualizado exitosamente' })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @ApiResponse({ status: 404, description: 'Caso de éxito no encontrado' })
    @UseGuards(AuthGuard)
    updateSuccessCase(
        @Param('id') id: string,
        @Body() updateSuccessCaseDto: UpdateSuccessCaseDto,
    ) {
        return this.successCasesService.update(id, updateSuccessCaseDto);
    }

    @Put(':id/publish')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar el estado de publicación de un caso de éxito' })
    @ApiResponse({ status: 200, description: 'Estado de publicación actualizado exitosamente' })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @ApiResponse({ status: 404, description: 'Caso de éxito no encontrado' })
    @UseGuards(AuthGuard)
    toggleSuccessCasePublish(
        @Param('id') id: string,
        @Body() publishDto: PublishSuccessCaseDto,
    ) {
        return this.successCasesService.togglePublish(id, publishDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar un caso de éxito' })
    @ApiResponse({ status: 200, description: 'Caso de éxito eliminado exitosamente' })
    @ApiResponse({ status: 403, description: 'Acceso denegado' })
    @ApiResponse({ status: 404, description: 'Caso de éxito no encontrado' })
    @UseGuards(AuthGuard)
    deleteSuccessCase(@Param('id') id: string) {
        return this.successCasesService.delete(id);
    }
} 