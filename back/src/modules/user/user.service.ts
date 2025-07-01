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
import { UserType } from '../user/roles.enum';

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
    console.log(`[UserService] Buscando usuario con email: ${email}`);
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      console.log(`[UserService] Usuario con email ${email} no encontrado`);
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    
    console.log(`[UserService] Usuario encontrado: ${user.id}, tipo de suscripción: ${user.subscriptionType}, expira: ${user.subscriptionExpiresAt}`);
    
    // Verificar si la suscripción está activa
    const isActive = user.subscriptionType !== 'Amateur' && 
                     user.subscriptionExpiresAt &&
                     new Date(user.subscriptionExpiresAt) > new Date();
    
    const result = {
      subscriptionType: user.subscriptionType || 'Amateur',
      isActive,
      expiresAt: user.subscriptionExpiresAt
    };
    
    console.log(`[UserService] Resultado de verificación: ${JSON.stringify(result)}`);
    return result;
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

  /**
   * Busca jugadores con filtros para suscriptores profesionales
   * @param filters Filtros de búsqueda (posición, nombre, etc.)
   * @returns Lista de jugadores filtrados
   */
  async searchPlayers(filters: {
    name?: string;
    primaryPosition?: string;
    nationality?: string;
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
    skillfulFoot?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ players: User[], total: number }> {
    const { 
      name, 
      primaryPosition, 
      nationality, 
      minAge, 
      maxAge, 
      minHeight, 
      maxHeight, 
      skillfulFoot,
      limit = 10,
      offset = 0
    } = filters;

    // Construir la consulta base
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.role = :role', { role: 'PLAYER' });

    // Aplicar filtros si están presentes
    if (name) {
      queryBuilder.andWhere(
        '(LOWER(user.name) LIKE LOWER(:name) OR LOWER(user.lastname) LIKE LOWER(:name))',
        { name: `%${name}%` }
      );
    }

    if (primaryPosition) {
      queryBuilder.andWhere('LOWER(user.primaryPosition) LIKE LOWER(:position)', 
        { position: `%${primaryPosition}%` }
      );
    }

    if (nationality) {
      queryBuilder.andWhere('LOWER(user.nationality) LIKE LOWER(:nationality)', 
        { nationality: `%${nationality}%` }
      );
    }

    if (minAge !== undefined) {
      queryBuilder.andWhere('user.age >= :minAge', { minAge });
    }

    if (maxAge !== undefined) {
      queryBuilder.andWhere('user.age <= :maxAge', { maxAge });
    }

    if (minHeight !== undefined) {
      queryBuilder.andWhere('user.height >= :minHeight', { minHeight });
    }

    if (maxHeight !== undefined) {
      queryBuilder.andWhere('user.height <= :maxHeight', { maxHeight });
    }

    if (skillfulFoot) {
      queryBuilder.andWhere('LOWER(user.skillfulFoot) = LOWER(:skillfulFoot)', { skillfulFoot });
    }

    // Obtener el total de resultados para la paginación
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    queryBuilder
      .orderBy('user.name', 'ASC')
      .limit(limit)
      .offset(offset);

    // Ejecutar la consulta
    const players = await queryBuilder.getMany();

    // Eliminar información sensible
    const sanitizedPlayers = players.map(player => {
      const { password, ...playerData } = player;
      return playerData;
    });

    return { 
      players: sanitizedPlayers as User[], 
      total 
    };
  }

  /**
   * Añade un jugador a la cartera del reclutador
   * @param recruiterId ID del reclutador
   * @param playerId ID del jugador a añadir
   * @returns El usuario reclutador actualizado
   */
  async addPlayerToPortfolio(recruiterId: string, playerId: string): Promise<User> {
    try {
      console.log(`Intentando añadir jugador ${playerId} a la cartera del reclutador ${recruiterId}`);
      
      // Verificar que el reclutador existe y es de tipo RECRUITER
      const recruiter = await this.userRepository.findOne({
        where: { id: recruiterId, role: UserType.RECRUITER },
        relations: ['portfolioPlayers']
      });
      
      if (!recruiter) {
        console.log(`Reclutador no encontrado o no tiene permisos: ${recruiterId}`);
        throw new NotFoundException('Reclutador no encontrado o no tiene permisos');
      }
      
      // Verificar que el jugador existe y es de tipo PLAYER
      const player = await this.userRepository.findOne({
        where: { id: playerId, role: UserType.PLAYER }
      });
      
      if (!player) {
        console.log(`Jugador no encontrado: ${playerId}`);
        throw new NotFoundException('Jugador no encontrado');
      }
      
      console.log(`Reclutador y jugador encontrados correctamente`);
      
      // Verificar si el jugador ya está en la cartera
      if (!recruiter.portfolioPlayers) {
        console.log('Inicializando array de portfolioPlayers');
        recruiter.portfolioPlayers = [];
      }
      
      const playerExists = recruiter.portfolioPlayers.some(p => p.id === playerId);
      
      if (playerExists) {
        console.log(`El jugador ${playerId} ya está en la cartera del reclutador ${recruiterId}`);
        return recruiter;
      }
      
      console.log(`Añadiendo jugador ${playerId} a la cartera`);
      recruiter.portfolioPlayers.push(player);
      
      const result = await this.userRepository.save(recruiter);
      console.log(`Jugador añadido correctamente a la cartera`);
      
      return result;
    } catch (error) {
      console.error('Error al añadir jugador a la cartera:', error);
      throw error;
    }
  }

  /**
   * Elimina un jugador de la cartera del reclutador
   * @param recruiterId ID del reclutador
   * @param playerId ID del jugador a eliminar
   * @returns El usuario reclutador actualizado
   */
  async removePlayerFromPortfolio(recruiterId: string, playerId: string): Promise<User> {
    // Verificar que el reclutador existe
    const recruiter = await this.userRepository.findOne({
      where: { id: recruiterId, role: UserType.RECRUITER },
      relations: ['portfolioPlayers']
    });
    
    if (!recruiter) {
      throw new NotFoundException('Reclutador no encontrado o no tiene permisos');
    }
    
    // Verificar si el jugador está en la cartera
    if (!recruiter.portfolioPlayers) {
      throw new NotFoundException('El jugador no está en la cartera');
    }
    
    // Filtrar el jugador de la cartera
    recruiter.portfolioPlayers = recruiter.portfolioPlayers.filter(
      player => player.id !== playerId
    );
    
    await this.userRepository.save(recruiter);
    
    return recruiter;
  }

  /**
   * Obtiene la lista de jugadores en la cartera del reclutador
   * @param recruiterId ID del reclutador
   * @returns Lista de jugadores en la cartera
   */
  async getPortfolioPlayers(recruiterId: string): Promise<User[]> {
    const recruiter = await this.userRepository.findOne({
      where: { id: recruiterId, role: UserType.RECRUITER },
      relations: ['portfolioPlayers']
    });
    
    if (!recruiter) {
      throw new NotFoundException('Reclutador no encontrado o no tiene permisos');
    }
    
    return recruiter.portfolioPlayers || [];
  }
}
