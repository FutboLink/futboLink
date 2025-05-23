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
    
    // Create a clean copy of the user object for the update
    const updateData = { ...user };
    
    // Handle trayectorias array properly for PostgreSQL
    if (updateData.trayectorias) {
      try {
        // Make sure it's a valid array
        if (!Array.isArray(updateData.trayectorias)) {
          // If it's a string, try to parse it
          if (typeof updateData.trayectorias === 'string') {
            updateData.trayectorias = JSON.parse(updateData.trayectorias);
          } else {
            throw new BadRequestException('Trayectorias must be an array');
          }
        }
        
        // For PostgreSQL jsonb array type, we need to use the specific update syntax
        // Remove trayectorias from the update object, we'll handle it separately
        delete updateData.trayectorias;
        
        // First update all other fields
        if (Object.keys(updateData).length > 0) {
          await this.userRepository.update(id, updateData);
        }
        
        // Then update the trayectorias field directly with SQL to ensure proper jsonb format
        if (Array.isArray(user.trayectorias) && user.trayectorias.length > 0) {
          // If we have items in the array, we'll convert each item to a jsonb object
          const trayectoriasItems = user.trayectorias.map(item => 
            `'${JSON.stringify(item).replace(/'/g, "''")}'::jsonb`
          ).join(',');
          
          await this.userRepository.query(
            `UPDATE users SET trayectorias = ARRAY[${trayectoriasItems}]::jsonb[] WHERE id = $1`,
            [id]
          );
        } else {
          // For empty arrays, use a direct empty array cast
          await this.userRepository.query(
            `UPDATE users SET trayectorias = ARRAY[]::jsonb[] WHERE id = $1`,
            [id]
          );
        }
      } catch (error) {
        throw new BadRequestException(`Error processing trayectorias: ${error.message}`);
      }
    } else {
      // If no trayectorias array, just do a normal update
      await this.userRepository.update(id, updateData);
    }
    
    const updatedUser = await this.userRepository.findOneBy({ id });

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const { password, ...userNoSensitiveInfo } = updatedUser;

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
