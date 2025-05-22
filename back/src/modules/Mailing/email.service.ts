import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor( private readonly mailerService: MailerService,
    private readonly configService: ConfigService) {}



  async sendPasswordResetEmail(email: string, token: string) {
    try {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        const resetUrl = `${frontendUrl}/resetPassword?token=${token}`;
       

console.log('Template Path:', this.configService.get<string>('NODE_ENV') === 'production' 
      ? 'dist/templates/password-reset' 
      :  'src/templates/password-reset');

      await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperación de Contraseña',
        template: 'password-reset', 
        context: {
          resetUrl,
        },
      });

      this.logger.log('Correo de recuperación de contraseña enviado.');
    } catch (error) {
      this.logger.error(
        `Error al enviar el correo de recuperación: ${error.message}`,
      );
      throw new Error(
        'No se pudo enviar el correo de recuperación. Inténtelo de nuevo más tarde.',
      );
    }
  }

  
  // Función para enviar el mensaje de contacto al administrador
  async sendContactEmailToAdmin(email: string, name: string, mensaje: string) {
    try {
      const adminEmail = this.configService.get<string>('MAIL_USER'); 
      
      if (!adminEmail) {
        this.logger.error('MAIL_USER configuration is missing');
        throw new Error('Email configuration is incomplete');
      }
      
      this.logger.log(`Attempting to send contact email to admin: ${adminEmail}`);
      this.logger.log(`From: ${email}, Name: ${name}`);
      
      // Log mail configuration for debugging
      const host = this.configService.get<string>('MAIL_HOST');
      const port = this.configService.get<string>('MAIL_PORT');
      const mailUser = this.configService.get<string>('MAIL_USER');
      const mailFrom = this.configService.get<string>('MAIL_FROM');
      
      this.logger.log(`Mail configuration - Host: ${host}, Port: ${port}, User: ${mailUser}, From: ${mailFrom}`);
     
      await this.mailerService.sendMail({
        to: adminEmail,
        subject: 'Nuevo mensaje de contacto',
        template: 'contact',
        context: {
          name,
          email,
          mensaje,
        },
      });

      this.logger.log('Mensaje de contacto enviado al administrador exitosamente.');
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar el correo de contacto: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw new Error('No se pudo enviar el mensaje. Inténtelo más tarde.');
    }
  }
}