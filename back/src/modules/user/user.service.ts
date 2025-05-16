import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express'; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, ...otherDetails } = registerUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      ...otherDetails,
    });

    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  
  async findOneByEmail(email: string) {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }
  }

  async updateUser(id: string, user: Partial<User>): Promise<Partial<User>> {
    if (Object.keys(user).length === 0) {
      throw new BadRequestException('No update values provided');
    }
    
    // Handle trayectorias array properly
    if (user.trayectorias) {
      try {
        // Make sure it's a valid array
        if (!Array.isArray(user.trayectorias)) {
          // If it's a string, try to parse it
          if (typeof user.trayectorias === 'string') {
            user.trayectorias = JSON.parse(user.trayectorias);
          } else {
            throw new BadRequestException('Trayectorias must be an array');
          }
        }
      } catch (error) {
        throw new BadRequestException(`Error processing trayectorias: ${error.message}`);
      }
    }
    
    await this.userRepository.update(id, user);
    const updateUser = await this.userRepository.findOneBy({ id });

    if (!updateUser) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const { password, ...userNoSensitiveInfo } = updateUser;

    return userNoSensitiveInfo;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }



}
