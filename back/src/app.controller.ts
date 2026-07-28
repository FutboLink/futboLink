import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// El webhook de Stripe vive en StripeWebhookController (payments/controllers).
// Acá había un segundo handler en 'stripe/webhook' que respondía 200
// {received:true} antes de validar la firma y procesaba en background tragándose
// los errores: Stripe registraba todos los eventos como exitosos aunque ninguno
// se procesara, y por eso el desfasaje de suscripciones pasó meses invisible.
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
