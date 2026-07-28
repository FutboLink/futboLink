import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StripeService } from '../services/stripe.service';

/**
 * Webhook de Stripe montado en DOS paths ('/payments/webhook' y '/stripe/webhook'):
 * el bootstrap tenía un body-parser apuntando a /stripe/webhook mientras el único
 * controller vivía en /payments/webhook, así que no hay certeza de cuál URL quedó
 * cargada en el dashboard de Stripe. Aceptar ambas evita que una URL mal cargada
 * vuelva a dejar los webhooks sin procesar.
 *
 * Requiere `rawBody: true` en NestFactory.create (main.ts): la verificación de
 * firma de Stripe necesita el cuerpo EXACTO, sin pasar por JSON.parse.
 */
@ApiTags('Payments')
@Controller(['payments', 'stripe'])
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({ name: 'stripe-signature', required: true, description: 'Stripe webhook signature header' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid webhook signature or missing raw body' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    if (!req.rawBody) {
      // Sin rawBody no se puede verificar la firma. Mensaje explícito para que un
      // error de configuración se detecte en el primer evento y no en silencio.
      this.logger.error(
        'Webhook recibido sin rawBody — falta `rawBody: true` en NestFactory.create. El evento NO se procesó.',
      );
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Webhook rechazado: rawBody no disponible (configuración del servidor)',
      });
    }

    try {
      const result = await this.stripeService.handleWebhookEvent(
        req.rawBody.toString('utf8'),
        signature,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(`Error procesando webhook de Stripe: ${error.message}`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message,
      });
    }
  }
}
