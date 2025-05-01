import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: User,
  })
  @Post('register')
  create(@Body() createUserDto: RegisterUserDto) {
    return this.userService.register(createUserDto);
  }

  
  @Get('cv/:filename')
getCv(@Param('filename') filename: string, @Res() res: Response) {
  const filePath = join(__dirname, '..', '..', 'uploads', 'cvs', filename);

  try {
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res); // Responde el archivo al cliente
  } catch (error) {
    res.status(404).send('Archivo no encontrado');
  }
}

  

  @ApiOperation({ summary: 'Traer los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [User] })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Traer usuario por Id' })
  @ApiResponse({ status: 200, description: 'Detalles del usaurio', type: User })
  @ApiResponse({ status: 404, description: 'UUsuario no encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Eliminar usuariopor ID' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Put(':id')
  @ApiBody({ type: RegisterUserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() user: Partial<User>,
  ) {
    return this.userService.updateUser(id, user);
  }
}