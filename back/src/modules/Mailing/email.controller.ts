import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { ContactFormDto } from './email.dto';


@Controller('email') 
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('contact') 
  async sendContactEmail(@Body() contactDto: ContactFormDto) {
    const { email, name, mensaje } = contactDto;

    try {

      await this.emailService.sendContactEmailToAdmin(email, name, mensaje);
      return { success: true, message: 'Mensaje enviado correctamente.' };
    } catch (error) {
      return { success: false, message: 'Error al enviar el mensaje.' };
    }
  }
}
