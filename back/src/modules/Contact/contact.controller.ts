import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as nodemailer from 'nodemailer';
import { ContactFormDto } from './contact.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
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

  @Post()
  @ApiOperation({ summary: 'Send contact form email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async sendContactEmail(@Body() contactForm: ContactFormDto) {
    const { email, name, mensaje } = contactForm;

    this.logger.log(`Received contact form from ${email} (${name})`);

    try {
      // Validate input
      if (!email || !name || !mensaje) {
        throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
      }

      // Send email to admin
      await this.sendEmailToAdmin(email, name, mensaje);
      
      // Send confirmation email to user
      await this.sendConfirmationEmail(email, name);

      return {
        success: true,
        message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
      };
    } catch (error) {
      this.logger.error(`Failed to send contact email: ${error.message}`);
      
      throw new HttpException({
        success: false,
        message: 'Error al enviar el mensaje. Por favor, inténtelo más tarde.',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async sendEmailToAdmin(email: string, name: string, mensaje: string): Promise<void> {
    const adminEmail = this.configService.get<string>('MAIL_USER');
    
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
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
    this.logger.log(`Contact email sent to admin successfully`);
  }

  private async sendConfirmationEmail(email: string, name: string): Promise<void> {
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
            <div style="margin-top: 15px;">
              <a href="https://instagram.com/futbolink" style="color: #3498db; margin: 0 10px; text-decoration: none;">Instagram</a>
              <a href="https://twitter.com/futbolink" style="color: #3498db; margin: 0 10px; text-decoration: none;">Twitter</a>
              <a href="https://facebook.com/futbolink" style="color: #3498db; margin: 0 10px; text-decoration: none;">Facebook</a>
            </div>
            <p>© ${new Date().getFullYear()} FutboLink. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
    this.logger.log(`Confirmation email sent to ${email} successfully`);
  }
} 