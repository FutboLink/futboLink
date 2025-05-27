import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      if (!frontendUrl) {
        this.logger.error('FRONTEND_URL environment variable is not set');
        throw new Error('Email configuration is incomplete');
      }
      
      const resetUrl = `${frontendUrl}/resetPassword?token=${token}`;
      
      this.logger.log(`Sending password reset email to: ${email}`);
      this.logger.log(`Reset URL: ${resetUrl}`);

      await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperación de Contraseña - FutboLink',
        template: 'password-reset', 
        context: {
          resetUrl,
          email,
        },
      });

      this.logger.log(`Password reset email sent successfully to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending password reset email: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw new Error('No se pudo enviar el correo de recuperación. Por favor, inténtelo más tarde.');
    }
  }
  
  async sendContactEmailToAdmin(email: string, name: string, mensaje: string) {
    // Validate input parameters
    if (!email || !name || !mensaje) {
      this.logger.error('Missing required parameters for contact email');
      throw new Error('Missing required contact form fields');
    }
    
    try {
      // Get admin email from environment variables
      const adminEmail = this.configService.get<string>('MAIL_USER');
      
      if (!adminEmail) {
        this.logger.error('MAIL_USER configuration is missing');
        throw new Error('Email configuration is incomplete');
      }
      
      this.logger.log(`Preparing to send contact email to admin: ${adminEmail}`);
      this.logger.log(`From: ${email}, Name: ${name}`);
      
      // Log email configuration for debugging
      const host = this.configService.get<string>('MAIL_HOST');
      const port = this.configService.get<string>('MAIL_PORT');
      
      if (!host || !port) {
        this.logger.error('Mail server configuration is incomplete');
        throw new Error('Email configuration is incomplete');
      }
      
      this.logger.log(`Mail configuration - Host: ${host}, Port: ${port}`);
     
      // Send the email
      const result = await this.mailerService.sendMail({
        to: adminEmail,
        subject: `Nuevo mensaje de contacto de ${name}`,
        template: 'contact',
        context: {
          name,
          email,
          mensaje,
          date: new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
      });

      this.logger.log(`Contact email sent successfully, messageId: ${result.messageId}`);
      
      // Send confirmation email to the user
      await this.sendContactConfirmationToUser(email, name);
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending contact email: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw new Error('No se pudo enviar el mensaje. Por favor, inténtelo más tarde.');
    }
  }
  
  // New method to send confirmation email to the user
  private async sendContactConfirmationToUser(email: string, name: string) {
    try {
      this.logger.log(`Sending confirmation email to user: ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Hemos recibido tu mensaje - FutboLink',
        template: 'contact-confirmation',
        context: {
          name,
          date: new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        },
      });
      
      this.logger.log(`Confirmation email sent successfully to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending confirmation email: ${error.message}`);
      // We don't throw here to avoid disrupting the main flow
      // The contact email was already sent to admin
      return false;
    }
  }
}