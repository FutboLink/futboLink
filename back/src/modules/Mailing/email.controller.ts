import { Controller, Post, Body, Logger, InternalServerErrorException } from '@nestjs/common';
import { EmailService } from './email.service';
import { ContactFormDto } from './email.dto';


@Controller('email') 
export class EmailController {
  private readonly logger = new Logger(EmailController.name);
  
  constructor(private readonly emailService: EmailService) {}

  @Post('contact') 
  async sendContactEmail(@Body() contactDto: ContactFormDto) {
    const { email, name, mensaje } = contactDto;

    this.logger.log(`Received contact form submission from ${email} (${name})`);
    
    try {
      await this.emailService.sendContactEmailToAdmin(email, name, mensaje);
      
      this.logger.log('Contact email sent successfully');
      return { 
        success: true, 
        message: 'Mensaje enviado correctamente.' 
      };
    } catch (error) {
      this.logger.error(`Failed to send contact email: ${error.message}`);
      
      // Return different error message based on the error
      if (error.message.includes('configuration is incomplete')) {
        this.logger.error('Mail server configuration is incomplete');
        throw new InternalServerErrorException('Error de configuración del servidor de correo. Por favor, contacte al administrador.');
      }
      
      return { 
        success: false, 
        message: 'Error al enviar el mensaje. Por favor, inténtelo más tarde.' 
      };
    }
  }
}
