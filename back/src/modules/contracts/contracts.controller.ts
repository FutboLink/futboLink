import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractService } from './contracts.service';

@ApiTags('Contracts')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un contrato',
    description: 'Crea un nuevo contrato en la base de datos.',
  })
  @ApiBody({
    type: CreateContractDto,
    description: 'Datos necesarios para crear un contrato.',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Contrato creado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para la creación del contrato.',
  })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.createContract(createContractDto);
  }

  /*
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los contratos',
    description: 'Devuelve una lista de todos los contratos existentes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contratos obtenida exitosamente.',
  })
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un contrato por ID',
    description: 'Devuelve un contrato basado en el ID proporcionado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato que deseas obtener.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato encontrado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un contrato',
    description: 'Actualiza los datos de un contrato existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato que deseas actualizar.',
    type: String,
  })
  @ApiBody({
    type: UpdateContractDto,
    description: 'Datos actualizados del contrato.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato actualizado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado.',
  })
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(+id, updateContractDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un contrato',
    description: 'Elimina un contrato basado en el ID proporcionado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato que deseas eliminar.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato eliminado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Contrato no encontrado.',
  })
  remove(@Param('id') id: string) {
    return this.contractsService.remove(+id);
  }
  */
}
