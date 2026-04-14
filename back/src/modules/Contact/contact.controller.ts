import {
  Controller,
  Post,
  Body,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactFormDto } from './contact.dto';
import { EmailService } from '../Mailing/email.service';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post()
  @ApiOperation({ summary: 'Send contact form email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async sendContactEmail(@Body() contactForm: ContactFormDto) {
    const { email, name, mensaje } = contactForm;

    this.logger.log(`Received contact form from ${email} (${name})`);

    try {
      if (!email || !name || !mensaje) {
        throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
      }

      await this.emailService.sendContactEmailToAdmin(email, name, mensaje);

      return {
        success: true,
        message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send contact email: ${error instanceof Error ? error.message : error}`,
      );

      throw new HttpException(
        {
          success: false,
          message:
            'Error al enviar el mensaje. Por favor, inténtelo más tarde.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
