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
    try {
      console.log("Attempting to register user with data:", JSON.stringify(registerUserDto, null, 2));
      
      const { email, password, ...otherDetails } = registerUserDto;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        console.log(`Registration failed: Email ${email} already in use`);
        throw new ConflictException('Email already in use');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        ...otherDetails,
      });

      console.log("User created successfully, saving to database");
      return this.userRepository.save(newUser);
    } catch (error) {
      console.error("Error in register service:", error);
      throw error;
    }
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

  /**
   * Actualiza el tipo de suscripción de un usuario
   * @param userId ID del usuario
   * @param subscriptionType Nuevo tipo de suscripción (Amateur, Semiprofesional, Profesional)
   * @returns Usuario actualizado
   */
  async updateUserSubscription(userId: string, subscriptionType: string): Promise<User> {
    const user = await this.findOne(userId);
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Actualizar el tipo de suscripción
    user.subscriptionType = subscriptionType;
    
    // Establecer la fecha de expiración (1 mes desde hoy)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);
    user.subscriptionExpiresAt = expirationDate;
    
    // Guardar los cambios
    return this.userRepository.save(user);
  }

  /**
   * Obtiene la información de suscripción de un usuario
   * @param userId ID del usuario
   * @returns Información de suscripción
   */
  async getUserSubscription(userId: string): Promise<{
    subscriptionType: string;
    isActive: boolean;
    expiresAt?: Date;
  }> {
    const user = await this.findOne(userId);
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Verificar si la suscripción está activa
    const isActive = user.subscriptionType !== 'Amateur' && 
                     user.subscriptionExpiresAt &&
                     new Date(user.subscriptionExpiresAt) > new Date();
    
    return {
      subscriptionType: user.subscriptionType,
      isActive,
      expiresAt: user.subscriptionExpiresAt
    };
  }

  /**
   * Actualiza el tipo de suscripción de un usuario por email
   * @param email Email del usuario
   * @param subscriptionType Nuevo tipo de suscripción
   * @returns Usuario actualizado
   */
  async updateUserSubscriptionByEmail(email: string, subscriptionType: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    
    // Actualizar el tipo de suscripción
    user.subscriptionType = subscriptionType;
    
    // Establecer la fecha de expiración (1 mes desde hoy)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);
    user.subscriptionExpiresAt = expirationDate;
    
    // Guardar los cambios
    return this.userRepository.save(user);
  }
  
  /**
   * Obtiene la información de suscripción de un usuario por email
   * @param email Email del usuario
   * @returns Información de suscripción
   */
  async getUserSubscriptionByEmail(email: string): Promise<{
    subscriptionType: string;
    isActive: boolean;
    expiresAt?: Date;
  }> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    
    // Verificar si la suscripción está activa
    const isActive = user.subscriptionType !== 'Amateur' && 
                     user.subscriptionExpiresAt &&
                     new Date(user.subscriptionExpiresAt) > new Date();
    
    return {
      subscriptionType: user.subscriptionType,
      isActive,
      expiresAt: user.subscriptionExpiresAt
    };
  }

  /**
   * Actualiza el tipo de suscripción de un usuario con una fecha de expiración específica
   * @param userId ID del usuario
   * @param subscriptionType Nuevo tipo de suscripción (Amateur, Premium)
   * @param expirationDate Fecha de expiración específica
   * @returns Usuario actualizado
   */
  async updateUserSubscriptionWithExpiration(
    userId: string, 
    subscriptionType: string, 
    expirationDate: Date
  ): Promise<User> {
    const user = await this.findOne(userId);
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Actualizar el tipo de suscripción
    user.subscriptionType = subscriptionType;
    
    // Establecer la fecha de expiración proporcionada
    user.subscriptionExpiresAt = expirationDate;
    
    // Guardar los cambios
    return this.userRepository.save(user);
  }
}
