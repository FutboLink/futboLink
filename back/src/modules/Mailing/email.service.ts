import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService
  ) {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`Mail configuration error: ${error.message}`);
      } else {
        this.logger.log('Mail server is ready to send messages');
      }
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://futbolink.vercel.app';
      const resetUrl = `${frontendUrl}/resetPassword?token=${token}`;
      
      this.logger.log(`Sending password reset email to: ${email}`);
      this.logger.log(`Reset URL: ${resetUrl}`);

      const mailOptions = {
        from: `"FutboLink" <${this.configService.get<string>('MAIL_FROM')}>`,
        to: email,
        subject: 'Recuperación de Contraseña - FutboLink',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #2c3e50; text-align: center;">Recuperación de Contraseña</h2>
            <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en FutboLink.</p>
              <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>
            
            <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
              <p>Si no solicitaste este cambio, puedes ignorar este correo electrónico y tu contraseña seguirá siendo la misma.</p>
              <p>Este enlace expirará en 48 horas por motivos de seguridad.</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
              <p>FutboLink - Conectando el mundo del fútbol</p>
              <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
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
      
      const mailOptions = {
        from: `"FutboLink Contact" <${this.configService.get<string>('MAIL_FROM')}>`,
        to: adminEmail,
        subject: `Nuevo mensaje de contacto de ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">Nuevo mensaje de contacto recibido</h2>
            <div style="margin-top: 20px;">
              <p><strong style="color: #27ae60;">Nombre:</strong> ${name}</p>
              <p><strong style="color: #27ae60;">Correo electrónico:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong style="color: #27ae60;">Mensaje:</strong></p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60;">
                <p>${mensaje.replace(/\n/g, '<br>')}</p>
              </div>
              <div style="margin-top: 20px; text-align: center;">
                <a href="mailto:${email}?subject=Re: Tu mensaje a FutboLink" 
                   style="display: inline-block; padding: 10px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px;">
                  Responder a ${name}
                </a>
              </div>
            </div>
            <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
              <p>Este es un correo automático enviado por el formulario de contacto de FutboLink.</p>
              <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Contact email sent to admin successfully`);
      
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
      
      const mailOptions = {
        from: `"FutboLink" <${this.configService.get<string>('MAIL_FROM')}>`,
        to: email,
        subject: 'Hemos recibido tu mensaje - FutboLink',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #2c3e50; text-align: center;">¡Gracias por contactar con FutboLink!</h2>
            <h3 style="color: #27ae60; text-align: center;">Hemos recibido tu mensaje</h3>
            
            <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
              <p>Hola ${name},</p>
              <p>Queremos confirmarte que hemos recibido tu mensaje. Uno de nuestros representantes lo revisará y te responderá a la brevedad.</p>
              <p>En FutboLink, nos dedicamos a conectar jugadores, representantes y agencias de fútbol de todo el mundo. Estamos comprometidos a brindarte el mejor servicio posible.</p>
              <p>Si tienes alguna consulta adicional, no dudes en responder a este correo electrónico o contactarnos por teléfono.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://futbolink.vercel.app" 
                 style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Visitar nuestra web
              </a>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
              <p>FutboLink - Conectando el mundo del fútbol</p>
              <p>Lecce, Apulia, Italia, 73100</p>
              <p>Teléfono: +393715851071 | Email: futbolink.contacto@gmail.com</p>
              <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
            </div>
          </div>
        `
      };
      
      await this.transporter.sendMail(mailOptions);
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