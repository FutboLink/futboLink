import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';

@Module({
  // Configuramos el módulo para cargar las variables de entorno desde el archivo indicado.
  imports: [ConfigModule.forRoot({ envFilePath: '.env.production.local' })],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
