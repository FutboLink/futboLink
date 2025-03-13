import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
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

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/cvs',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
  }))
  uploadCv(@UploadedFile() file: Express.Multer.File) {
    return { filename: file.filename, path: `/uploads/cvs/${file.filename}` };
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
