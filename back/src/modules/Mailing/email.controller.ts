import { Controller, Post, Body, Logger, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { EmailService } from './email.service';
import { ContactFormDto } from './email.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Email')
@Controller('email') 
export class EmailController {
  private readonly logger = new Logger(EmailController.name);
  
  constructor(private readonly emailService: EmailService) {}

  @Post('contact') 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send contact form email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  @ApiResponse({ status: 500, description: 'Server error' })
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
      
      // Log more detailed error info for debugging
      this.logger.error(`Error stack: ${error.stack}`);
      this.logger.error(`Error type: ${error.name}`);
      
      // Handle different types of errors
      if (error.message.includes('configuration is incomplete')) {
        throw new HttpException({
          success: false,
          message: 'Error de configuración del servidor de correo. Por favor, contacte al administrador.'
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      // General error
      throw new HttpException({
        success: false,
        message: 'Error al enviar el mensaje. Por favor, inténtelo más tarde.'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
