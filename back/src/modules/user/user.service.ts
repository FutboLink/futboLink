import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, EntityManager } from 'typeorm';
import { RegisterUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { UserType, PasaporteUe } from './roles.enum';
import { RepresentationRequest, RepresentationRequestStatus } from './entities/representation-request.entity';
import { VerificationRequest, VerificationRequestStatus } from './entities/verification-request.entity';
import { EmailService } from '../Mailing/email.service';
import { CreateRepresentationRequestDto, UpdateRepresentationRequestDto } from './dto/representation-request.dto';
import { CreateVerificationRequestDto, UpdateVerificationRequestDto } from './dto/verification-request.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationRequest)
    private readonly verificationRequestRepository: Repository<VerificationRequest>,
    private readonly entityManager: EntityManager,
    private readonly emailService: EmailService,
  ) {
    // Intentar crear la tabla de cartera de reclutadores si no existe
    this.createPortfolioTableIfNotExists();
    // Intentar crear la tabla de solicitudes de representación si no existe
    this.createRepresentationRequestsTableIfNotExists();
    // Intentar crear la tabla de solicitudes de verificación si no existe
    this.createVerificationRequestsTableIfNotExists();
    // Asegurar que existan las columnas de verificación de email
    this.ensureEmailVerificationColumnsExist();
  }

  /**
   * Crea la tabla de cartera de reclutadores si no existe
   */
  private async createPortfolioTableIfNotExists() {
    try {
      const queryRunner = this.userRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();

      // Verificar si la tabla ya existe
      const tableExists = await queryRunner.hasTable('recruiter_portfolio');
      if (!tableExists) {
        console.log('Creando tabla recruiter_portfolio...');
        
        // Crear la tabla
        await queryRunner.query(`
          CREATE TABLE "recruiter_portfolio" (
            "recruiterId" uuid NOT NULL,
            "playerId" uuid NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_recruiter_portfolio" PRIMARY KEY ("recruiterId", "playerId")
          )
        `);
        
        // Añadir restricciones de clave foránea
        await queryRunner.query(`
          ALTER TABLE "recruiter_portfolio" 
          ADD CONSTRAINT "FK_recruiter_portfolio_recruiter" 
          FOREIGN KEY ("recruiterId") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
        `);
        
        await queryRunner.query(`
          ALTER TABLE "recruiter_portfolio" 
          ADD CONSTRAINT "FK_recruiter_portfolio_player" 
          FOREIGN KEY ("playerId") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
        `);
        
        console.log('Tabla recruiter_portfolio creada correctamente');
      } else {
        console.log('La tabla recruiter_portfolio ya existe');
      }
      
      await queryRunner.release();
    } catch (error) {
      console.error('Error al crear la tabla recruiter_portfolio:', error);
    }
  }

  /**
   * Crea la tabla de solicitudes de representación si no existe
   */
  private async createRepresentationRequestsTableIfNotExists() {
    try {
      const queryRunner = this.userRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();

      // Verificar si la tabla ya existe
      const tableExists = await queryRunner.hasTable('representation_requests');
      if (!tableExists) {
        console.log('Creando tabla representation_requests...');
        
        // Crear el tipo enum para el estado de la solicitud
        await queryRunner.query(`
          CREATE TYPE "public"."representation_request_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');
        `);
        
        // Crear la tabla de solicitudes de representación
        await queryRunner.query(`
          CREATE TABLE "representation_requests" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "recruiterId" uuid NOT NULL,
            "playerId" uuid NOT NULL,
            "status" "public"."representation_request_status_enum" NOT NULL DEFAULT 'PENDING',
            "message" text,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_representation_requests" PRIMARY KEY ("id")
          )
        `);
        
        // Añadir restricciones de clave foránea
        await queryRunner.query(`
          ALTER TABLE "representation_requests" 
          ADD CONSTRAINT "FK_representation_requests_recruiter" 
          FOREIGN KEY ("recruiterId") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
        `);
        
        await queryRunner.query(`
          ALTER TABLE "representation_requests" 
          ADD CONSTRAINT "FK_representation_requests_player" 
          FOREIGN KEY ("playerId") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
        `);
        
        console.log('Tabla representation_requests creada correctamente');
      } else {
        console.log('La tabla representation_requests ya existe');
      }
      
      await queryRunner.release();
    } catch (error) {
      console.error('Error al crear la tabla representation_requests:', error);
    }
  }

  /**
   * Crea la tabla de solicitudes de verificación si no existe
   */
  private async createVerificationRequestsTableIfNotExists() {
    try {
      const queryRunner = this.userRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();

      // Verificar si la tabla ya existe
      const tableExists = await queryRunner.hasTable('verification_requests');
      if (!tableExists) {
        console.log('Creando tabla verification_requests...');
        
        // Crear el tipo enum para el estado de la solicitud
        await queryRunner.query(`
          CREATE TYPE "public"."verification_request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
        `);
        
        // Crear la tabla de solicitudes de verificación
        await queryRunner.query(`
          CREATE TABLE "verification_requests" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "playerId" uuid NOT NULL,
            "status" "public"."verification_request_status_enum" NOT NULL DEFAULT 'PENDING',
            "message" text,
            "adminComments" text,
            "processedBy" uuid,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_verification_requests" PRIMARY KEY ("id")
          )
        `);
        
        // Añadir restricciones de clave foránea
        await queryRunner.query(`
          ALTER TABLE "verification_requests" 
          ADD CONSTRAINT "FK_verification_requests_player" 
          FOREIGN KEY ("playerId") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
        `);
        
        await queryRunner.query(`
          ALTER TABLE "verification_requests" 
          ADD CONSTRAINT "FK_verification_requests_admin" 
          FOREIGN KEY ("processedBy") 
          REFERENCES "users"("id") 
          ON DELETE SET NULL
        `);
        
        console.log('Tabla verification_requests creada correctamente');
      } else {
        console.log('La tabla verification_requests ya existe');
      }
      
      await queryRunner.release();
    } catch (error) {
      console.error('Error al crear la tabla verification_requests:', error);
    }
  }

  /**
   * Asegura que existan las columnas de verificación de email en la tabla users
   */
  private async ensureEmailVerificationColumnsExist() {
    try {
      const queryRunner = this.userRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();

      // Verificar si la columna isEmailVerified existe
      const hasIsEmailVerified = await queryRunner.hasColumn('users', 'isEmailVerified');
      if (!hasIsEmailVerified) {
        console.log('Creando columna isEmailVerified en tabla users...');
        // Los usuarios existentes se marcan como verificados (true), solo los nuevos empiezan en false
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
        // Marcar todos los usuarios existentes como verificados
        await queryRunner.query(`UPDATE "users" SET "isEmailVerified" = true`);
        console.log('Columna isEmailVerified creada y usuarios existentes marcados como verificados');
      }

      // Verificar si la columna emailVerificationToken existe
      const hasEmailVerificationToken = await queryRunner.hasColumn('users', 'emailVerificationToken');
      if (!hasEmailVerificationToken) {
        console.log('Creando columna emailVerificationToken en tabla users...');
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationToken" character varying`);
        console.log('Columna emailVerificationToken creada correctamente');
      }

      // Migración: marcar usuarios existentes (sin token) como verificados
      // Esto cubre el caso donde la columna ya existía pero los usuarios no fueron migrados
      try {
        const result = await queryRunner.query(
          `UPDATE "users" SET "isEmailVerified" = true WHERE "isEmailVerified" = false AND "emailVerificationToken" IS NULL`
        );
        if (result && result[1] > 0) {
          console.log(`Migración: ${result[1]} usuarios existentes marcados como verificados`);
        }
      } catch (migrationError) {
        console.error('Error en migración de verificación:', migrationError);
      }

      await queryRunner.release();
    } catch (error) {
      console.error('Error al crear columnas de verificación de email:', error);
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    try {
      console.log("Attempting to register user with data:", JSON.stringify(registerUserDto, null, 2));
      
      const { email, password, role, ...otherDetails } = registerUserDto;

      // Validar lastname manualmente: es requerido para todos los roles excepto CLUB
      if (role !== UserType.CLUB) {
        if (!registerUserDto.lastname || registerUserDto.lastname.trim() === '') {
          throw new BadRequestException('lastname is required for this role');
        }
      }

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

      // Create new user - si es CLUB y lastname no está presente, usar null
      const userData: Partial<User> = {
        email,
        password: hashedPassword,
        role: role || UserType.PLAYER,
        ...otherDetails,
      };

      // Si es CLUB y lastname no está presente o está vacío, no incluirlo o usar null
      if (role === UserType.CLUB) {
        // Para CLUB, lastname puede ser null/undefined
        if (registerUserDto.lastname === undefined || registerUserDto.lastname === null || registerUserDto.lastname === '') {
          userData.lastname = null;
        } else {
          userData.lastname = registerUserDto.lastname;
        }
      } else {
        // Para otros roles, usar el lastname proporcionado
        userData.lastname = registerUserDto.lastname || null;
      }

      // Generar token de verificación de email
      const crypto = require('crypto');
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      userData.isEmailVerified = false;
      userData.emailVerificationToken = emailVerificationToken;

      const newUser = this.userRepository.create(userData);

      console.log("User created successfully, saving to database");
      const savedUser: User = await this.userRepository.save(newUser);

      // Enviar email de verificación
      try {
        await this.emailService.sendEmailVerification(
          savedUser.email,
          savedUser.name,
          emailVerificationToken,
        );
        console.log(`Verification email sent to ${savedUser.email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // No lanzar error - el usuario ya fue creado, puede reenviar el email
      }

      return savedUser;
    } catch (error) {
      console.error("Error in register service:", error);
      throw error;
    }
  }

  /**
   * Verifica el email de un usuario usando el token enviado por email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      if (!token) {
        throw new BadRequestException('Token de verificación requerido');
      }

      const user = await this.userRepository.findOne({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        throw new BadRequestException('Token de verificación inválido o expirado');
      }

      if (user.isEmailVerified) {
        return { message: 'El email ya fue verificado anteriormente' };
      }

      // Marcar como verificado y limpiar el token
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await this.userRepository.save(user);

      console.log(`Email verified successfully for user: ${user.email}`);
      return { message: 'Email verificado exitosamente. Ya puedes iniciar sesión.' };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Reenvía el email de verificación a un usuario
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      if (!email) {
        throw new BadRequestException('Email requerido');
      }

      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (user.isEmailVerified) {
        return { message: 'El email ya fue verificado' };
      }

      // Generar nuevo token
      const crypto = require('crypto');
      const newToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = newToken;
      await this.userRepository.save(user);

      // Enviar email
      await this.emailService.sendEmailVerification(user.email, user.name, newToken);

      console.log(`Verification email resent to: ${user.email}`);
      return { message: 'Email de verificación reenviado exitosamente' };
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 300): Promise<{ data: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const take = Math.min(limit, 500); // máximo 500 por página
    const skip = (page - 1) * take;

    const [data, total] = await this.userRepository.findAndCount({
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true,
        role: true,
        imgUrl: true,
        subscriptionType: true,
        createdAt: true,
        nationality: true,
      },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      data,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
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
    const savedUser = await this.userRepository.save(user);
    
    // Si el usuario es un jugador y tiene suscripción Semiprofesional o Profesional,
    // marcar automáticamente como verificado
    if (user.role === UserType.PLAYER && 
        (subscriptionType === 'Semiprofesional' || subscriptionType === 'Profesional')) {
      try {
        // Verificar si ya está verificado para evitar actualizaciones innecesarias
        const isVerified = await this.isUserVerifiedSafe(user.id);
        
        if (!isVerified) {
          // Marcar como verificado
          const verifiedResult = await this.markUserAsVerifiedSafe(user.id);
          
          if (verifiedResult) {
            // Establecer el nivel de verificación según el tipo de suscripción
            let verificationLevel: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' = 'SEMIPROFESSIONAL';
            if (subscriptionType === 'Profesional') {
              verificationLevel = 'PROFESSIONAL';
            }
            
            await this.setUserVerificationLevelSafe(user.id, verificationLevel);
            console.log(`Usuario ${user.id} marcado automáticamente como verificado con nivel ${verificationLevel} después de pagar suscripción ${subscriptionType}`);
          } else {
            console.warn(`No se pudo marcar como verificado al usuario ${user.id} después de pagar suscripción`);
          }
        } else {
          // Si ya está verificado, actualizar el nivel si es necesario
          const currentLevel = await this.getUserVerificationLevelSafe(user.id);
          let newLevel: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' = 'SEMIPROFESSIONAL';
          if (subscriptionType === 'Profesional') {
            newLevel = 'PROFESSIONAL';
          }
          
          // Solo actualizar si el nuevo nivel es superior o diferente
          if (currentLevel !== newLevel && 
              (newLevel === 'PROFESSIONAL' || currentLevel === 'NONE' || currentLevel === 'AMATEUR')) {
            await this.setUserVerificationLevelSafe(user.id, newLevel);
            console.log(`Nivel de verificación actualizado a ${newLevel} para usuario ${user.id}`);
          }
        }
      } catch (error) {
        // No fallar la actualización de suscripción si hay error en la verificación
        console.error(`Error al marcar usuario como verificado automáticamente: ${error.message}`, error);
      }
    }
    
    return savedUser;
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
    const savedUser = await this.userRepository.save(user);
    
    // Si el usuario es un jugador y tiene suscripción Semiprofesional o Profesional,
    // marcar automáticamente como verificado
    if (user.role === UserType.PLAYER && 
        (subscriptionType === 'Semiprofesional' || subscriptionType === 'Profesional')) {
      try {
        // Verificar si ya está verificado para evitar actualizaciones innecesarias
        const isVerified = await this.isUserVerifiedSafe(user.id);
        
        if (!isVerified) {
          // Marcar como verificado
          const verifiedResult = await this.markUserAsVerifiedSafe(user.id);
          
          if (verifiedResult) {
            // Establecer el nivel de verificación según el tipo de suscripción
            let verificationLevel: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' = 'SEMIPROFESSIONAL';
            if (subscriptionType === 'Profesional') {
              verificationLevel = 'PROFESSIONAL';
            }
            
            await this.setUserVerificationLevelSafe(user.id, verificationLevel);
            console.log(`Usuario ${user.id} marcado automáticamente como verificado con nivel ${verificationLevel} después de pagar suscripción ${subscriptionType}`);
          } else {
            console.warn(`No se pudo marcar como verificado al usuario ${user.id} después de pagar suscripción`);
          }
        } else {
          // Si ya está verificado, actualizar el nivel si es necesario
          const currentLevel = await this.getUserVerificationLevelSafe(user.id);
          let newLevel: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' = 'SEMIPROFESSIONAL';
          if (subscriptionType === 'Profesional') {
            newLevel = 'PROFESSIONAL';
          }
          
          // Solo actualizar si el nuevo nivel es superior o diferente
          if (currentLevel !== newLevel && 
              (newLevel === 'PROFESSIONAL' || currentLevel === 'NONE' || currentLevel === 'AMATEUR')) {
            await this.setUserVerificationLevelSafe(user.id, newLevel);
            console.log(`Nivel de verificación actualizado a ${newLevel} para usuario ${user.id}`);
          }
        }
      } catch (error) {
        // No fallar la actualización de suscripción si hay error en la verificación
        console.error(`Error al marcar usuario como verificado automáticamente: ${error.message}`, error);
      }
    }
    
    return savedUser;
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
    const savedUser = await this.userRepository.save(user);
    
    // Si el usuario es un jugador y tiene suscripción Semiprofesional o Profesional,
    // marcar automáticamente como verificado
    if (user.role === UserType.PLAYER && 
        (subscriptionType === 'Semiprofesional' || subscriptionType === 'Profesional')) {
      try {
        // Verificar si ya está verificado para evitar actualizaciones innecesarias
        const isVerified = await this.isUserVerifiedSafe(user.id);
        
        if (!isVerified) {
          // Marcar como verificado
          const verifiedResult = await this.markUserAsVerifiedSafe(user.id);
          
          if (verifiedResult) {
            // Establecer el nivel de verificación según el tipo de suscripción
            let verificationLevel: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' = 'SEMIPROFESSIONAL';
            if (subscriptionType === 'Profesional') {
              verificationLevel = 'PROFESSIONAL';
            }
            
            await this.setUserVerificationLevelSafe(user.id, verificationLevel);
            console.log(`Usuario ${user.id} marcado automáticamente como verificado con nivel ${verificationLevel} después de pagar suscripción ${subscriptionType}`);
          } else {
            console.warn(`No se pudo marcar como verificado al usuario ${user.id} después de pagar suscripción`);
          }
        } else {
          // Si ya está verificado, actualizar el nivel si es necesario
          const currentLevel = await this.getUserVerificationLevelSafe(user.id);
          let newLevel: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' = 'SEMIPROFESSIONAL';
          if (subscriptionType === 'Profesional') {
            newLevel = 'PROFESSIONAL';
          }
          
          // Solo actualizar si el nuevo nivel es superior o diferente
          if (currentLevel !== newLevel && 
              (newLevel === 'PROFESSIONAL' || currentLevel === 'NONE' || currentLevel === 'AMATEUR')) {
            await this.setUserVerificationLevelSafe(user.id, newLevel);
            console.log(`Nivel de verificación actualizado a ${newLevel} para usuario ${user.id}`);
          }
        }
      } catch (error) {
        // No fallar la actualización de suscripción si hay error en la verificación
        console.error(`Error al marcar usuario como verificado automáticamente: ${error.message}`, error);
      }
    }
    
    return savedUser;
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
    pasaporteUe?: PasaporteUe;
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
      pasaporteUe,
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

    // Filtro por pasaporte UE
    if (pasaporteUe) {
      queryBuilder.andWhere('user.pasaporteUe = :pasaporteUe', { pasaporteUe });
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
   * Busca jugadores y reclutadores con filtros para suscriptores profesionales
   * @param filters Filtros de búsqueda (posición, nombre, etc.)
   * @returns Lista de jugadores y reclutadores filtrados
   */
  async searchUsersAndRecruiters(filters: {
    name?: string;
    primaryPosition?: string;
    nationality?: string;
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
    skillfulFoot?: string;
    pasaporteUe?: PasaporteUe;
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: User[], total: number }> {
    const { 
      name, 
      primaryPosition, 
      nationality, 
      minAge, 
      maxAge, 
      minHeight, 
      maxHeight, 
      skillfulFoot,
      pasaporteUe,
      role,
      limit = 10,
      offset = 0
    } = filters;

    // Construir la consulta base para incluir tanto jugadores como reclutadores
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles: ['PLAYER', 'RECRUITER'] });

    // Filtrar por rol específico si se proporciona
    if (role && (role === 'PLAYER' || role === 'RECRUITER')) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

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

    // Filtro por pasaporte UE
    if (pasaporteUe) {
      queryBuilder.andWhere('user.pasaporteUe = :pasaporteUe', { pasaporteUe });
    }

    // Obtener el total de resultados para la paginación
    const total = await queryBuilder.getCount();

    // Aplicar paginación y ordenamiento
    // Ordenar por rol primero (PLAYER primero, luego RECRUITER), luego por nombre
    queryBuilder
      .orderBy('CASE WHEN user.role = :playerRole THEN 0 ELSE 1 END', 'ASC')
      .addOrderBy('user.name', 'ASC')
      .setParameter('playerRole', 'PLAYER')
      .limit(limit)
      .offset(offset);

    // Ejecutar la consulta
    const users = await queryBuilder.getMany();

    // Eliminar información sensible
    const sanitizedUsers = users.map(user => {
      const { password, ...userData } = user;
      return userData;
    });

    return { 
      users: sanitizedUsers as User[], 
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

  /**
   * Envía una solicitud de representación a un jugador
   * @param recruiterId ID del reclutador
   * @param createRepresentationRequestDto DTO con los datos de la solicitud
   * @returns La solicitud creada
   */
  async sendRepresentationRequest(
    recruiterId: string,
    createRepresentationRequestDto: CreateRepresentationRequestDto,
  ): Promise<RepresentationRequest> {
    const { playerId, message } = createRepresentationRequestDto;

    // Verificar que el reclutador existe
    const recruiter = await this.userRepository.findOne({
      where: { id: recruiterId },
    });
    if (!recruiter) {
      throw new NotFoundException(`Reclutador con ID ${recruiterId} no encontrado`);
    }

    // Verificar que el reclutador es de tipo RECRUITER
    if (recruiter.role !== UserType.RECRUITER) {
      throw new BadRequestException('Solo los reclutadores pueden enviar solicitudes de representación');
    }

    // Verificar que el jugador existe
    const player = await this.userRepository.findOne({
      where: { id: playerId },
    });
    if (!player) {
      throw new NotFoundException(`Jugador con ID ${playerId} no encontrado`);
    }

    // Verificar que el jugador es de tipo PLAYER
    if (player.role !== UserType.PLAYER) {
      throw new BadRequestException('Solo se pueden enviar solicitudes de representación a jugadores');
    }

    // Verificar si ya existe una solicitud pendiente
    const existingRequest = await this.entityManager.findOne(RepresentationRequest, {
      where: {
        recruiterId,
        playerId,
        status: RepresentationRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Ya existe una solicitud de representación pendiente para este jugador');
    }

    // Crear la solicitud
    const request = this.entityManager.create(RepresentationRequest, {
      recruiterId,
      playerId,
      message,
      status: RepresentationRequestStatus.PENDING,
    });

    const savedRequest = await this.entityManager.save(request);

    // Enviar email de notificación
    try {
      await this.emailService.sendRepresentationRequestEmail(
        player.email,
        player.name || 'Jugador',
        recruiter.name || 'Reclutador',
        recruiter.lastname || '',
        recruiter.nameAgency || 'Agente independiente',
        message || 'Me gustaría representarte como agente'
      );
    } catch (error) {
      console.error('Error al enviar email de solicitud de representación:', error);
      // No bloqueamos el proceso si falla el envío del email
    }

    // Crear notificación para el jugador
    try {
      // Intentamos crear la notificación usando una consulta SQL directa para evitar dependencias circulares
      console.log('Creando notificación para el jugador:', playerId);
      
      // Usamos un tipo de notificación existente (PROFILE_VIEW) en lugar de REPRESENTATION_REQUEST
      // pero incluimos la información de la solicitud en los metadatos
      console.log('Datos de la notificación:', {
        message: message || `${recruiter.name} ${recruiter.lastname} quiere representarte como agente`,
        type: 'PROFILE_VIEW', // Tipo existente en el enum
        userId: playerId,
        sourceUserId: recruiterId,
        metadata: {
          requestId: savedRequest.id,
          recruiterName: `${recruiter.name} ${recruiter.lastname}`,
          recruiterAgency: recruiter.nameAgency || '',
          isRepresentationRequest: true // Marcador para identificar que es una solicitud de representación
        }
      });
      
      await this.entityManager.query(`
        INSERT INTO notifications (message, type, "userId", "sourceUserId", metadata)
        VALUES (
          $1, 
          'PROFILE_VIEW', 
          $2, 
          $3, 
          $4
        )
      `, [
        message || `${recruiter.name} ${recruiter.lastname} quiere representarte como agente`,
        playerId,
        recruiterId,
        JSON.stringify({
          requestId: savedRequest.id,
          recruiterName: `${recruiter.name} ${recruiter.lastname}`,
          recruiterAgency: recruiter.nameAgency || '',
          isRepresentationRequest: true // Marcador para identificar que es una solicitud de representación
        })
      ]);
      
      console.log('Notificación creada correctamente');
    } catch (error) {
      console.error('Error al crear notificación de solicitud de representación:', error);
      // No bloqueamos el proceso si falla la creación de la notificación
    }

    return savedRequest;
  }

  /**
   * Responde a una solicitud de representación
   * @param requestId ID de la solicitud
   * @param playerId ID del jugador que responde
   * @param updateRepresentationRequestDto DTO con la respuesta
   * @returns La solicitud actualizada
   */
  async respondToRepresentationRequest(
    requestId: string,
    playerId: string,
    updateRepresentationRequestDto: UpdateRepresentationRequestDto,
  ): Promise<RepresentationRequest> {
    // Verificar que la solicitud existe y pertenece al jugador
    const request = await this.entityManager.findOne(RepresentationRequest, {
      where: { id: requestId, playerId },
      relations: ['recruiter', 'player']
    });
    
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    
    if (request.status !== RepresentationRequestStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya ha sido respondida');
    }
    
    // Actualizar el estado de la solicitud
    request.status = updateRepresentationRequestDto.status as RepresentationRequestStatus;
    const updatedRequest = await this.entityManager.save(request);
    
    // Si la solicitud fue aceptada, añadir el jugador a la cartera del reclutador
    if (updatedRequest.status === RepresentationRequestStatus.ACCEPTED) {
      try {
        await this.addPlayerToPortfolio(request.recruiterId, playerId);
        console.log(`Jugador ${playerId} añadido a la cartera del reclutador ${request.recruiterId}`);
      } catch (error) {
        console.error('Error al añadir jugador a la cartera:', error);
        // No lanzamos error aquí para no interrumpir el flujo si falla la adición a la cartera
      }
      
      // Enviar email al reclutador informando que su solicitud fue aceptada
      try {
        await this.emailService.sendEmail({
          to: request.recruiter.email,
          subject: 'Solicitud de representación aceptada',
          template: 'contact', // Usar una plantilla existente por ahora
          context: {
            name: request.recruiter.name,
            playerName: `${request.player.name} ${request.player.lastname}`,
            message: 'Ha aceptado tu solicitud de representación.'
          }
        });
      } catch (emailError) {
        console.error('Error al enviar email de notificación:', emailError);
      }
    } else if (updatedRequest.status === RepresentationRequestStatus.REJECTED) {
      // Enviar email al reclutador informando que su solicitud fue rechazada
      try {
        await this.emailService.sendEmail({
          to: request.recruiter.email,
          subject: 'Solicitud de representación rechazada',
          template: 'contact', // Usar una plantilla existente por ahora
          context: {
            name: request.recruiter.name,
            playerName: `${request.player.name} ${request.player.lastname}`,
            message: 'Ha rechazado tu solicitud de representación.'
          }
        });
      } catch (emailError) {
        console.error('Error al enviar email de notificación:', emailError);
      }
    }
    
    return updatedRequest;
  }

  /**
   * Obtiene las solicitudes de representación enviadas por un reclutador
   * @param recruiterId ID del reclutador
   * @returns Lista de solicitudes
   */
  async getRecruiterSentRequests(recruiterId: string): Promise<RepresentationRequest[]> {
    return this.entityManager.find(RepresentationRequest, {
      where: { recruiterId },
      relations: ['player'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene las solicitudes de representación recibidas por un jugador
   * @param playerId ID del jugador
   * @returns Lista de solicitudes
   */
  async getPlayerReceivedRequests(playerId: string): Promise<RepresentationRequest[]> {
    return this.entityManager.find(RepresentationRequest, {
      where: { playerId },
      relations: ['recruiter'],
      order: { createdAt: 'DESC' }
    });
  }

  // ========== MÉTODOS DE VERIFICACIÓN DE PERFIL (IMPLEMENTACIÓN SEGURA) ==========
  
  /**
   * Verifica si la columna isVerified existe en la tabla users
   */
  private async checkIsVerifiedColumnExists(): Promise<boolean> {
    try {
      const result = await this.entityManager.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'isVerified'
      `);
      return result.length > 0;
    } catch (error) {
      console.error('Error verificando columna isVerified:', error);
      return false;
    }
  }

  /**
   * Verifica si la columna verificationLevel existe en la tabla users
   */
  private async checkVerificationLevelColumnExists(): Promise<boolean> {
    try {
      const result = await this.entityManager.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'verificationLevel'
      `);
      return result.length > 0;
    } catch (error) {
      console.error('Error verificando columna verificationLevel:', error);
      return false;
    }
  }

  /**
   * Verifica si un usuario está verificado usando query directo
   */
  private async isUserVerifiedSafe(userId: string): Promise<boolean> {
    try {
      const columnExists = await this.checkIsVerifiedColumnExists();
      if (!columnExists) {
        return false; // Si la columna no existe, consideramos que no está verificado
      }
      
      const result = await this.entityManager.query(
        'SELECT "isVerified" FROM users WHERE id = $1',
        [userId]
      );
      
      return result[0]?.isVerified || false;
    } catch (error) {
      console.error('Error verificando estado de verificación:', error);
      return false;
    }
  }

  /**
   * Obtiene el nivel de verificación del usuario usando query directo
   */
  private async getUserVerificationLevelSafe(userId: string): Promise<'NONE' | 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR'> {
    try {
      const columnExists = await this.checkVerificationLevelColumnExists();
      if (!columnExists) {
        return 'NONE';
      }
      const result = await this.entityManager.query(
        'SELECT "verificationLevel" FROM users WHERE id = $1',
        [userId]
      );
      return (result[0]?.verificationLevel || 'NONE') as 'NONE' | 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR';
    } catch (error) {
      console.error('Error obteniendo verificationLevel:', error);
      return 'NONE';
    }
  }

  /**
   * Marca un usuario como verificado usando query directo
   */
  private async markUserAsVerifiedSafe(userId: string): Promise<boolean> {
    try {
      const columnExists = await this.checkIsVerifiedColumnExists();
      if (!columnExists) {
        console.log('Columna isVerified no existe, no se puede marcar como verificado');
        return false;
      }
      
      await this.entityManager.query(
        'UPDATE users SET "isVerified" = true WHERE id = $1',
        [userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error marcando usuario como verificado:', error);
      return false;
    }
  }

  /**
   * Establece el nivel de competencia del usuario basado en la verificación
   */
  private async setUserVerificationLevelSafe(
    userId: string,
    level: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR',
  ): Promise<boolean> {
    try {
      // Mapear el nivel de verificación al competitionLevel
      let competitionLevel: string;
      if (level === 'PROFESSIONAL') {
        competitionLevel = 'professional';
      } else if (level === 'SEMIPROFESSIONAL') {
        competitionLevel = 'semiprofessional';
      } else {
        competitionLevel = 'amateur';
      }
      
      await this.entityManager.query(
        'UPDATE users SET "competitionlevel" = $1 WHERE id = $2',
        [competitionLevel, userId]
      );
      
      // También actualizar verificationLevel para compatibilidad
      const columnExists = await this.checkVerificationLevelColumnExists();
      if (!columnExists) {
        // Crear la columna si no existe para no fallar silenciosamente
        await this.entityManager.query(`
          ALTER TABLE "users" 
          ADD COLUMN "verificationLevel" VARCHAR(32) NOT NULL DEFAULT 'NONE'
        `).catch(() => {});
      }
      await this.entityManager.query(
        'UPDATE users SET "verificationLevel" = $1 WHERE id = $2',
        [level, userId]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando competitionLevel y verificationLevel:', error);
      return false;
    }
  }

  // ========== MÉTODOS DE VERIFICACIÓN DE PERFIL ==========

  /**
   * Crea una solicitud de verificación de perfil
   * @param playerId ID del jugador que solicita verificación
   * @param createVerificationRequestDto DTO con los datos de la solicitud
   * @returns La solicitud creada
   */
  async createVerificationRequest(
    playerId: string,
    createVerificationRequestDto: CreateVerificationRequestDto,
  ): Promise<VerificationRequest> {
    // Verificar que el usuario existe y es un jugador
    const player = await this.userRepository.findOne({
      where: { id: playerId, role: UserType.PLAYER },
    });
    
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    // Verificar si ya tiene una solicitud pendiente
    const existingRequest = await this.verificationRequestRepository.findOne({
      where: {
        playerId,
        status: VerificationRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Ya tienes una solicitud de verificación pendiente');
    }

    // Verificar si ya está verificado usando método seguro
    const isVerified = await this.isUserVerifiedSafe(playerId);
    if (isVerified) {
      throw new BadRequestException('Tu perfil ya está verificado');
    }

    // Crear la solicitud
    const request = this.verificationRequestRepository.create({
      playerId,
      message: createVerificationRequestDto.message,
      attachmentUrl: createVerificationRequestDto.attachmentUrl,
      status: VerificationRequestStatus.PENDING,
    });

    const savedRequest = await this.verificationRequestRepository.save(request);

    // Crear notificación para los administradores
    try {
      // Obtener todos los administradores
      const admins = await this.userRepository.find({
        where: { role: UserType.ADMIN },
      });

      // Crear notificación para cada administrador
      for (const admin of admins) {
        await this.entityManager.query(`
          INSERT INTO notifications (message, type, "userId", "sourceUserId", metadata)
          VALUES ($1, 'PROFILE_VIEW', $2, $3, $4)
        `, [
          `${player.name} ${player.lastname} ha solicitado verificación de perfil`,
          admin.id,
          playerId,
          JSON.stringify({
            verificationRequestId: savedRequest.id,
            playerName: `${player.name} ${player.lastname}`,
            isVerificationRequest: true
          })
        ]);
      }
    } catch (error) {
      console.error('Error al crear notificaciones para administradores:', error);
    }

    return savedRequest;
  }

  /**
   * Actualiza manualmente el nivel de verificación de un usuario (admin)
   */
  async updateUserVerificationLevel(
    userId: string,
    level: 'NONE' | 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR',
  ): Promise<{ success: boolean; verificationLevel: string; isVerified: boolean }>{
    // Mapear el nivel de verificación al competitionLevel
    let competitionLevel = 'amateur';
    if (level === 'PROFESSIONAL') {
      competitionLevel = 'professional';
    } else if (level === 'SEMIPROFESSIONAL') {
      competitionLevel = 'semiprofessional';
    } else if (level === 'AMATEUR') {
      competitionLevel = 'amateur';
    }

    // Asegurar columnas
    const hasLevelColumn = await this.checkVerificationLevelColumnExists();
    if (!hasLevelColumn) {
      await this.entityManager.query(`
        ALTER TABLE "users" 
        ADD COLUMN "verificationLevel" VARCHAR(32) NOT NULL DEFAULT 'NONE'
      `);
    }

    const isVerified = level !== 'NONE';
    if (await this.checkIsVerifiedColumnExists()) {
      await this.entityManager.query(
        'UPDATE users SET "isVerified" = $1, "verificationLevel" = $2, "competitionlevel" = $3 WHERE id = $4',
        [isVerified, level, competitionLevel, userId]
      );
    } else {
      // Crear columna isVerified si no existe
      await this.entityManager.query(`
        ALTER TABLE "users" 
        ADD COLUMN "isVerified" boolean NOT NULL DEFAULT false
      `);
      await this.entityManager.query(
        'UPDATE users SET "isVerified" = $1, "verificationLevel" = $2, "competitionlevel" = $3 WHERE id = $4',
        [isVerified, level, competitionLevel, userId]
      );
    }

    return { success: true, verificationLevel: level, isVerified };
  }

  /**
   * Procesa una solicitud de verificación (aprueba o rechaza)
   * @param requestId ID de la solicitud
   * @param adminId ID del administrador que procesa
   * @param updateVerificationRequestDto DTO con la decisión
   * @returns La solicitud actualizada
   */
  async processVerificationRequest(
    requestId: string,
    adminId: string,
    updateVerificationRequestDto: UpdateVerificationRequestDto,
  ): Promise<VerificationRequest> {
    // Verificar que el admin existe y es administrador
    const admin = await this.userRepository.findOne({
      where: { id: adminId, role: UserType.ADMIN },
    });
    
    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }

    // Buscar la solicitud
    const request = await this.verificationRequestRepository.findOne({
      where: { id: requestId },
      relations: ['player'],
    });
    
    if (!request) {
      throw new NotFoundException('Solicitud de verificación no encontrada');
    }
    
    if (request.status !== VerificationRequestStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya ha sido procesada');
    }
    
    // Actualizar la solicitud
    request.status = updateVerificationRequestDto.status;
    request.adminComments = updateVerificationRequestDto.adminComments;
    request.processedBy = adminId;
    
    const updatedRequest = await this.verificationRequestRepository.save(request);
    
    // Si fue aprobada, marcar al usuario como verificado y establecer nivel
    if (updatedRequest.status === VerificationRequestStatus.APPROVED) {
      const verifiedOk = await this.markUserAsVerifiedSafe(request.playerId);
      if (!verifiedOk) {
        console.warn(`No se pudo marcar como verificado al usuario ${request.playerId} - columna isVerified no existe`);
      }

      // Validar y establecer explícitamente el nivel de verificación seleccionado por el admin
      const rawType = (updateVerificationRequestDto as any)?.verificationType;
      if (!rawType || (rawType !== 'PROFESSIONAL' && rawType !== 'SEMIPROFESSIONAL' && rawType !== 'AMATEUR')) {
        throw new BadRequestException('Debe seleccionar un tipo de verificación válido (PROFESSIONAL, SEMIPROFESSIONAL o AMATEUR)');
      }
      const desiredLevel: 'PROFESSIONAL' | 'SEMIPROFESSIONAL' | 'AMATEUR' = rawType;
      const levelOk = await this.setUserVerificationLevelSafe(request.playerId, desiredLevel);
      if (!levelOk) {
        console.warn(`No se pudo establecer verificationLevel para el usuario ${request.playerId}`);
      }
    }
    
    // Crear notificación para el jugador
    try {
      const statusMessage = updatedRequest.status === VerificationRequestStatus.APPROVED 
        ? '¡Tu perfil ha sido verificado exitosamente! 🎉'
        : 'Tu solicitud de verificación ha sido rechazada';
        
      await this.entityManager.query(`
        INSERT INTO notifications (message, type, "userId", "sourceUserId", metadata)
        VALUES ($1, 'PROFILE_VIEW', $2, $3, $4)
      `, [
        statusMessage,
        request.playerId,
        adminId,
        JSON.stringify({
          verificationRequestId: updatedRequest.id,
          status: updatedRequest.status,
          adminComments: updatedRequest.adminComments,
          isVerificationResponse: true
        })
      ]);
    } catch (error) {
      console.error('Error al crear notificación para el jugador:', error);
    }
    
    return updatedRequest;
  }

  /**
   * Obtiene el estado de verificación de un usuario (método público seguro)
   * @param userId ID del usuario
   * @returns Estado de verificación
   */
  async getUserVerificationStatus(userId: string): Promise<{ isVerified: boolean; columnExists: boolean; verificationLevel: 'NONE' | 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR' }> {
    const isVerifiedColumn = await this.checkIsVerifiedColumnExists();
    const isVerified = isVerifiedColumn ? await this.isUserVerifiedSafe(userId) : false;
    const hasLevelColumn = await this.checkVerificationLevelColumnExists();
    const verificationLevel = hasLevelColumn ? await this.getUserVerificationLevelSafe(userId) : 'NONE';
    return {
      isVerified,
      columnExists: isVerifiedColumn,
      verificationLevel, // Siempre incluir verificationLevel
    };
  }

  /**
   * Fuerza la creación de la columna isVerified (solo para admins)
   */
  async forceCreateVerificationColumn(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔧 FORZANDO creación de columna isVerified...');
      
      // Verificar si la columna existe
      const columnExists = await this.checkIsVerifiedColumnExists();
      
      if (columnExists) {
        return {
          success: true,
          message: 'La columna isVerified ya existe'
        };
      }
      
      // Crear la columna usando query directo
      await this.entityManager.query(`
        ALTER TABLE "users" 
        ADD COLUMN "isVerified" boolean NOT NULL DEFAULT false
      `);
      
      // Marcar como verificado a los usuarios que tengan solicitudes aprobadas
      await this.entityManager.query(`
        UPDATE users 
        SET "isVerified" = true 
        WHERE id IN (
          SELECT DISTINCT "playerId" 
          FROM verification_requests 
          WHERE status = 'APPROVED'
        )
      `);
      
      return {
        success: true,
        message: 'Columna isVerified creada exitosamente y usuarios actualizados'
      };
      
    } catch (error) {
      console.error('❌ Error al crear columna forzadamente:', error);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Obtiene todas las solicitudes de verificación pendientes para el administrador
   * @returns Lista de solicitudes pendientes
   */
  async getPendingVerificationRequests(): Promise<VerificationRequest[]> {
    return this.verificationRequestRepository.find({
      where: { status: VerificationRequestStatus.PENDING },
      relations: ['player'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene todas las solicitudes de verificación
   * @returns Lista de todas las solicitudes
   */
  async getAllVerificationRequests(): Promise<VerificationRequest[]> {
    return this.verificationRequestRepository.find({
      relations: ['player', 'admin'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene las solicitudes de verificación de un jugador específico
   * @param playerId ID del jugador
   * @returns Lista de solicitudes del jugador
   */
  async getPlayerVerificationRequests(playerId: string): Promise<VerificationRequest[]> {
    return this.verificationRequestRepository.find({
      where: { playerId },
      relations: ['admin'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Verifica si un usuario tiene suscripción activa
   * @param email Email del usuario
   * @returns True si tiene suscripción activa
   */
  private async checkActiveSubscription(email: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) return false;
      
      // Verificar si el usuario tiene una suscripción Semiprofesional o Profesional
      const validSubscriptionType = user.subscriptionType === 'Semiprofesional' || 
                                   user.subscriptionType === 'Profesional';
      
      // Verificar si no ha expirado
      const isActive = validSubscriptionType && 
                      user.subscriptionExpiresAt &&
                      new Date(user.subscriptionExpiresAt) > new Date();
      
      return isActive || validSubscriptionType; // Por ahora permitimos también sin expiración
    } catch (error) {
      console.error('Error verificando suscripción:', error);
      return false;
    }
  }

  /**
   * Método público para marcar un usuario como verificado (para uso desde otros servicios)
   */
  async markUserAsVerifiedPublic(userId: string): Promise<boolean> {
    return await this.markUserAsVerifiedSafe(userId);
  }

  /**
   * Método público para establecer el nivel de verificación (para uso desde otros servicios)
   */
  async setUserVerificationLevelPublic(
    userId: string,
    level: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR',
  ): Promise<boolean> {
    return await this.setUserVerificationLevelSafe(userId, level);
  }

  /**
   * Marca automáticamente al usuario como verificado después de pagar suscripción de verificación
   * @param userId ID del usuario
   * @param verificationLevel Nivel de verificación (default: AMATEUR)
   * @returns Resultado de la operación
   */
  async autoVerifyUserAfterPayment(
    userId: string,
    verificationLevel: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR' = 'AMATEUR',
  ): Promise<{ success: boolean; message: string; isVerified: boolean; verificationLevel: string }> {
    try {
      // Verificar que el usuario existe y es un jugador
      const user = await this.userRepository.findOne({
        where: { id: userId, role: UserType.PLAYER },
      });

      if (!user) {
        throw new NotFoundException('Jugador no encontrado');
      }

      // Verificar si ya está verificado
      const isVerified = await this.isUserVerifiedSafe(userId);
      if (isVerified) {
        // Si ya está verificado, actualizar el nivel si es necesario
        const currentLevel = await this.getUserVerificationLevelSafe(userId);
        
        // Solo actualizar si el nuevo nivel es superior
        if (verificationLevel === 'PROFESSIONAL' || 
            (verificationLevel === 'SEMIPROFESSIONAL' && (currentLevel === 'NONE' || currentLevel === 'AMATEUR'))) {
          await this.setUserVerificationLevelSafe(userId, verificationLevel);
          return {
            success: true,
            message: 'Nivel de verificación actualizado',
            isVerified: true,
            verificationLevel,
          };
        }
        
        return {
          success: true,
          message: 'El usuario ya está verificado',
          isVerified: true,
          verificationLevel: currentLevel,
        };
      }

      // Marcar como verificado
      const verifiedResult = await this.markUserAsVerifiedSafe(userId);
      if (!verifiedResult) {
        return {
          success: false,
          message: 'No se pudo marcar como verificado - columna isVerified no existe',
          isVerified: false,
          verificationLevel: 'NONE',
        };
      }

      // Establecer el nivel de verificación
      const levelResult = await this.setUserVerificationLevelSafe(userId, verificationLevel);
      if (!levelResult) {
        return {
          success: false,
          message: 'No se pudo establecer el nivel de verificación',
          isVerified: true,
          verificationLevel: 'NONE',
        };
      }

      return {
        success: true,
        message: 'Usuario marcado como verificado exitosamente',
        isVerified: true,
        verificationLevel,
      };
    } catch (error) {
      console.error('Error al verificar automáticamente al usuario:', error);
      throw error;
    }
  }
}
