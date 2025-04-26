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

 
  }
