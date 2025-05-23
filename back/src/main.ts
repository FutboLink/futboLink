import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://www.futbolink.it', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma,Expires',
    exposedHeaders: 'Content-Range,X-Total-Count',
    maxAge: 3600
  });

  const config = new DocumentBuilder()
    .setTitle('API Futbolink')
    .setDescription('Documentación del back')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Aumentar el límite del tamaño del cuerpo de la petición para grandes cargas
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.use(
    '/stripe/webhook',
    bodyParser.raw({ type: 'application/json' }) 
  );

  await app.listen(process.env.PORT || 3001);
}
bootstrap();