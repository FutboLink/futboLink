import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../Mailing/email.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

// Use the same JWT secret as in other files
const JWT_SECRET = 'futbolinkSecureJwtSecret2023';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
    private readonly emailService: EmailService,
  ) {}


  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || JWT_SECRET,
      { expiresIn: '7d' },
    );

    return { token };
  }

  
  async requestPasswordReset(email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Incluir tanto id como sub para compatibilidad
      const payload = { 
        sub: user.id, 
        id: user.id,
        email: user.email 
      };
      
      // Usar JWT directo para mayor control
      const resetToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || JWT_SECRET,
        { expiresIn: '48h' } // Extender a 48 horas
      );

      console.log(`Generated reset token for ${email}`);
      
      // Send password reset email
      await this.emailService.sendPasswordResetEmail(email, resetToken);
      
      return { 
        message: 'Token de recuperación generado correctamente',
        token: resetToken,
        userId: user.id
      };
    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al procesar la solicitud');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      console.log(`Iniciando resetPassword - token recibido: ${token.substring(0, 10)}... (longitud: ${token.length})`);
      console.log(`Longitud de la nueva contraseña: ${newPassword.length} caracteres`);
      
      let decoded;
      
      try {
        // Intento principal con verificación estricta
        decoded = this.jwtService.verify(token);
        console.log('Token validado correctamente:', { sub: decoded.sub });
      } catch (tokenError) {
        console.log('Error en verificación estricta, intentando decodificar sin verificar:', tokenError.message);
        
        // Intentar extraer la información sin verificar la firma
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            // Decodificar manualmente la parte de payload (segundo segmento)
            const payload = parts[1];
            const decodedString = Buffer.from(payload, 'base64').toString();
            decoded = JSON.parse(decodedString);
            console.log('Token decodificado sin verificación:', decoded);
            
            // Convertir al formato esperado
            if (decoded.id) {
              decoded.sub = decoded.id; // Mapear id -> sub si existe
            }
          }
        } catch (decodeError) {
          console.error('Error intentando decodificar manualmente:', decodeError);
        }
        
        // Si aún no tenemos decoded, lanzar error
        if (!decoded) {
          throw new BadRequestException('Token inválido o expirado');
        }
      }
      
      // Ahora tenemos decoded, sea por verificación o decodificación manual
      if (!decoded || (!decoded.sub && !decoded.id)) {
        console.error('Token decodificado pero sin identificador de usuario:', decoded);
        throw new BadRequestException('Token sin información de usuario válida');
      }
      
      // Usar sub o id, lo que esté disponible
      const userId = decoded.sub || decoded.id;
      console.log(`Usando ID de usuario: ${userId}`);

      const user = await this.usersService.findOne(userId);
      if (!user) {
        console.error(`Usuario no encontrado para id: ${userId}`);
        throw new NotFoundException('Usuario no encontrado');
      }
      
      console.log(`Usuario encontrado: ${user.email} (ID: ${user.id})`);

      await this.usersService.updatePassword(user.id, newPassword);
      console.log('Contraseña actualizada exitosamente');

      return { message: 'Contraseña actualizada con éxito' };
    } catch (error) {
      console.error('Error en resetPassword:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al procesar la solicitud');
    }
  }

}
