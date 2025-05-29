import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  // Create the application with logging
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Get config service
  const configService = app.get(ConfigService);
  
  // Define allowed origins based on environment
  const allowedOrigins = [
    'http://localhost:3000',  // Development frontend
    'http://localhost:3001',  // Possible alternate port
    'https://futbolink.vercel.app',
    'https://futbolink.it',
    'https://www.futbolink.it'    // Production frontend with www
  ];
  
  // Add any additional origins from environment variables if configured
  const additionalOrigins = configService.get<string>('ADDITIONAL_CORS_ORIGINS');
  if (additionalOrigins) {
    allowedOrigins.push(...additionalOrigins.split(','));
  }
  
  // Add a wildcard in development mode
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('*');
  }
  
  console.log('Allowed CORS origins:', allowedOrigins);

  // Comprehensive CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked request from disallowed origin: ${origin}`);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,Origin,X-Requested-With,X-CSRF-Token',
    exposedHeaders: 'Content-Disposition,X-RateLimit-Limit,X-RateLimit-Remaining',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 24 hours
  });
  
  // Add security headers with helmet
  app.use(helmet());
  
  // Enable validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('API Futbolink')
    .setDescription('API documentation for Futbolink application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('contact', 'Contact form endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configure body parser for stripe webhooks
  app.use(
    '/stripe/webhook',
    bodyParser.raw({ type: 'application/json' }) 
  );

  // Get port from environment or use default
  const port = configService.get<number>('PORT') || 3000;
  
  // Start the server
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();