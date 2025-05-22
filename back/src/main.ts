import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Futbolink')
    .setDescription('Documentación del back')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configure raw body parsing for webhook endpoint
  app.use(
    '/stripe/webhook',
    bodyParser.raw({ type: 'application/json' }) 
  );
  
  // Configure JSON body parser for all other routes
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  await app.listen(3001);
}
bootstrap();