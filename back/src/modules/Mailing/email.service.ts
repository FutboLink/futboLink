import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const mailFrom = this.configService.get<string>('MAIL_FROM');
    this.resend = apiKey ? new Resend(apiKey) : null;

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY is not set — outbound email will fail until configured.',
      );
    } else {
      this.logger.log(
        `Resend email enabled (from=${mailFrom ?? 'not set — set MAIL_FROM'})`,
      );
    }
  }

  /** Verified domain address in Resend, e.g. onboarding@resend.dev or noreply@yourdomain.com */
  private getDefaultFrom(displayName: string = 'FutboLink'): string {
    const addr = this.configService.get<string>('MAIL_FROM');
    if (!addr?.trim()) {
      throw new Error(
        'MAIL_FROM must be set to a Resend-verified sender address',
      );
    }
    return `"${displayName}" <${addr.trim()}>`;
  }

  private async sendWithResend(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    if (!this.resend) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    const from = params.from ?? this.getDefaultFrom();
    const { data, error } = await this.resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
      throw new Error(
        (error as { message?: string }).message || 'Resend send failed',
      );
    }
    this.logger.log(`Email sent via Resend (id=${data?.id ?? 'n/a'})`);
  }

  /**
   * HTML email for notification flows (profile view, shortlisted, etc.).
   */
  async sendHtmlEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      await this.sendWithResend({ to, subject, html });
      return true;
    } catch (err) {
      this.logger.error(
        `sendHtmlEmail failed: ${err instanceof Error ? err.message : err}`,
      );
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.logger.log(
        `Sending email to: ${options.to}, subject: ${options.subject}`,
      );

      let htmlContent = '';

      switch (options.template) {
        case 'contact':
          htmlContent = this.generateContactTemplate(options.context);
          break;
        case 'representation-request':
          htmlContent = this.generateRepresentationRequestTemplate(
            options.context,
          );
          break;
        case 'representation-response':
          htmlContent = this.generateRepresentationResponseTemplate(
            options.context,
          );
          break;
        default:
          htmlContent = this.generateDefaultTemplate(options.context);
      }

      await this.sendWithResend({
        to: options.to,
        subject: options.subject,
        html: htmlContent,
      });
      this.logger.log(`Email sent successfully to: ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending email: ${error instanceof Error ? error.message : error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      return false;
    }
  }

  private generateRepresentationRequestTemplate(context: any): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Nueva Solicitud de Representación</h2>
        <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
          <p>Hola ${context.name},</p>
          <p>El reclutador <strong>${context.recruiterName}</strong> está interesado en representarte.</p>
          <p>Mensaje del reclutador:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60;">
            <p>${context.message}</p>
          </div>
          <p>Para responder a esta solicitud, inicia sesión en tu cuenta de FutboLink.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://futbolink.vercel.app/PanelUsers/Player" 
             style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ir a mi cuenta
          </a>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
          <p>FutboLink - Conectando el mundo del fútbol</p>
          <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
  }

  private generateRepresentationResponseTemplate(context: any): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Respuesta a tu Solicitud de Representación</h2>
        <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
          <p>Hola ${context.name},</p>
          <p>El jugador <strong>${context.playerName}</strong> ha respondido a tu solicitud de representación.</p>
          <p>${context.message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://futbolink.vercel.app/PanelUsers/Manager" 
             style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ir a mi cuenta
          </a>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
          <p>FutboLink - Conectando el mundo del fútbol</p>
          <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
  }

  private generateContactTemplate(context: any): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Mensaje de FutboLink</h2>
        <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
          <p>Hola ${context.name},</p>
          <p>${context.message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://futbolink.vercel.app" 
             style="display: inline-block; padding: 12px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Visitar FutboLink
          </a>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
          <p>FutboLink - Conectando el mundo del fútbol</p>
          <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
  }

  private generateDefaultTemplate(context: any): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #2c3e50; text-align: center;">Mensaje de FutboLink</h2>
        <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
          <p>${context.message || 'Gracias por usar FutboLink.'}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
          <p>FutboLink - Conectando el mundo del fútbol</p>
          <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
  }

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      const rawFrontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://futbolink.vercel.app';
      const frontendUrl = rawFrontendUrl.replace(/\/+$/, '');
      const resetUrl = `${frontendUrl}/resetPassword?token=${token}`;

      this.logger.log(`Sending password reset email to: ${email}`);
      this.logger.log(`Reset URL: ${resetUrl}`);

      const html = `
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
        `;

      await this.sendWithResend({
        to: email,
        subject: 'Recuperación de Contraseña - FutboLink',
        html,
      });
      this.logger.log(`Password reset email sent successfully to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending password reset email: ${error instanceof Error ? error.message : error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      throw new Error(
        'No se pudo enviar el correo de recuperación. Por favor, inténtelo más tarde.',
      );
    }
  }

  async sendContactEmailToAdmin(email: string, name: string, mensaje: string) {
    if (!email || !name || !mensaje) {
      this.logger.error('Missing required parameters for contact email');
      throw new Error('Missing required contact form fields');
    }

    try {
      const adminEmail = this.configService.get<string>('MAIL_USER');

      if (!adminEmail) {
        this.logger.error('MAIL_USER configuration is missing');
        throw new Error('Email configuration is incomplete');
      }

      this.logger.log(`Preparing to send contact email to admin: ${adminEmail}`);
      this.logger.log(`From: ${email}, Name: ${name}`);

      const html = `
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
        `;

      await this.sendWithResend({
        to: adminEmail,
        subject: `Nuevo mensaje de contacto de ${name}`,
        html,
        from: this.getDefaultFrom('FutboLink Contact'),
      });

      this.logger.log(`Contact email sent to admin successfully`);

      await this.sendContactConfirmationToUser(email, name);

      return true;
    } catch (error) {
      this.logger.error(
        `Error sending contact email: ${error instanceof Error ? error.message : error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      throw new Error(
        'No se pudo enviar el mensaje. Por favor, inténtelo más tarde.',
      );
    }
  }

  private async sendContactConfirmationToUser(email: string, name: string) {
    try {
      this.logger.log(`Sending confirmation email to user: ${email}`);

      const html = `
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
        `;

      await this.sendWithResend({
        to: email,
        subject: 'Hemos recibido tu mensaje - FutboLink',
        html,
      });
      this.logger.log(`Confirmation email sent successfully to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending confirmation email: ${error instanceof Error ? error.message : error}`,
      );
      return false;
    }
  }

  async sendEmailVerification(
    email: string,
    name: string,
    token: string,
  ): Promise<boolean> {
    try {
      const frontendUrl = 'https://www.futbolink.net';
      const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

      this.logger.log(`Sending email verification to: ${email}`);
      this.logger.log(`Verification URL: ${verifyUrl}`);

      const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2c3e50;">¡Bienvenido a FutboLink!</h2>
            </div>
            <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
              <p>Hola <strong>${name}</strong>,</p>
              <p>Gracias por registrarte en FutboLink. Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                 style="display: inline-block; padding: 14px 28px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Verificar mi cuenta
              </a>
            </div>
            
            <div style="margin-top: 20px; line-height: 1.6; color: #34495e;">
              <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
              <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 14px;">
                <a href="${verifyUrl}" style="color: #27ae60;">${verifyUrl}</a>
              </p>
              <p>Este enlace expirará en 24 horas por motivos de seguridad.</p>
              <p>Si no creaste una cuenta en FutboLink, puedes ignorar este correo.</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 15px;">
              <p>FutboLink - Conectando el mundo del fútbol</p>
              <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
            </div>
          </div>
        `;

      await this.sendWithResend({
        to: email,
        subject: 'Verifica tu cuenta - FutboLink',
        html,
      });
      this.logger.log(`Verification email sent to: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending verification email: ${error instanceof Error ? error.message : error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      return false;
    }
  }

  async sendRepresentationRequestEmail(
    email: string,
    playerName: string,
    recruiterName: string,
    recruiterLastname: string,
    recruiterAgency: string,
    message: string,
  ): Promise<boolean> {
    try {
      const subject = 'Nueva solicitud de representación en FutboLink';

      return await this.sendEmail({
        to: email,
        subject,
        template: 'representation-request',
        context: {
          name: playerName,
          recruiterName: `${recruiterName} ${recruiterLastname}`,
          recruiterAgency,
          message,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error sending representation request email: ${error instanceof Error ? error.message : error}`,
      );
      return false;
    }
  }
}
