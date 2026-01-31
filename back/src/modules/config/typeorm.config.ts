/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { Payment } from '../../payments/entities/payment.entity';

dotenvConfig({ path: '.env.development' });

const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  // Fallback to individual env vars if DATABASE_URL is not available (for local development)
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : (+process.env.DB_PORT || 5432),
  username: process.env.DATABASE_URL ? undefined : process.env.DB_USERNAME,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  dropSchema: false,
  logging: process.env.NODE_ENV === 'development', // Solo logging en desarrollo para reducir memoria
  synchronize: false,
  // Optimizaciones de memoria
  extra: {
    max: 10, // Reducir pool de conexiones (default 10, pero asegurarse)
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 30000,
  },
  entities: [
    __dirname + '/../**/*.entity.{js,ts}',
    __dirname + '/../../**/*.entity.{js,ts}',
    Payment
  ],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
