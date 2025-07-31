import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function ensureIsVerifiedColumn() {
  try {
    console.log('🔍 Verificando columna isVerified...');
    const dataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    });
    
    await dataSource.initialize();
    console.log('🔗 Conexión a base de datos establecida');
    
    // Verificar si la columna existe
    const result = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'isVerified'
    `);
    
    if (result.length === 0) {
      console.log('🔧 Agregando columna isVerified a la tabla users...');
      await dataSource.query(`
        ALTER TABLE "users" 
        ADD COLUMN "isVerified" boolean NOT NULL DEFAULT false
      `);
      console.log('✅ Columna isVerified agregada exitosamente');
      
      // Marcar como verificado a los usuarios que tengan solicitudes aprobadas
      try {
        console.log('🔄 Actualizando usuarios con solicitudes aprobadas...');
        await dataSource.query(`
          UPDATE users 
          SET "isVerified" = true 
          WHERE id IN (
            SELECT DISTINCT "playerId" 
            FROM verification_requests 
            WHERE status = 'APPROVED'
          )
        `);
        console.log('✅ Usuarios con solicitudes aprobadas marcados como verificados');
      } catch (updateError) {
        console.warn('⚠️ No se pudieron actualizar usuarios verificados:', updateError);
      }
    } else {
      console.log('✅ La columna isVerified ya existe');
    }
    
    await dataSource.destroy();
    console.log('🔌 Conexión cerrada');
  } catch (error) {
    console.error('❌ Error al verificar/crear columna isVerified:', error);
  }
}

async function bootstrap() {
  // Asegurar que la columna isVerified existe antes de iniciar la app
  await ensureIsVerifiedColumn();

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
    'https://futbolink.vercel.app', // Include www subdomain
    'https://futbolink.net',     // New domain
    'https://www.futbolink.net'  // Include www subdomain for new domain
    //   // Production frontend
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
      
      // Allow exact matches
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow any futbolink.it domain or subdomain
      if (origin.match(/^https:\/\/(.*\.)?futbolink\.it$/)) {
        return callback(null, true);
      }
      
      // Allow any futbolink.net domain or subdomain
      if (origin.match(/^https:\/\/(.*\.)?futbolink\.net$/)) {
        return callback(null, true);
      }
      
      // Allow any futbolink.vercel.app domain
      if (origin.match(/^https:\/\/(.*\.)?futbolink\.vercel\.app$/)) {
        return callback(null, true);
      }
      
      console.warn(`Blocked request from disallowed origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
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
