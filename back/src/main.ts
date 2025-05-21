import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Configure CORS with allowable origins
  app.enableCors({
    origin: process.env.FRONTEND_DOMAIN || ['http://localhost:3000', 'https://futbolink.com'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // Body parser middleware setup
  // Use raw body parser for Stripe webhook routes
  app.use('/stripe/webhook', 
    bodyParser.raw({ type: 'application/json' })
  );
  
  // To ensure backward compatibility, support the legacy webhook URL
  app.use('/payments/webhook',
    bodyParser.raw({ type: 'application/json' })
  );
  
  // Use regular JSON body parser for other routes
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('API Futbolink')
    .setDescription('Documentación del back')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
bootstrap();