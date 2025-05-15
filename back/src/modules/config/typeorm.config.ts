/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { Payment } from '../../payments/entities/payment.entity';

dotenvConfig({ path: '.env.development' });

const config: DataSourceOptions = {
  type: 'postgres',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  /*   ssl: {
    rejectUnauthorized: false,
  }, */
  dropSchema: false,
  logging: true,
  synchronize: true,
  entities: [
    __dirname + '/../**/*.entity.{js,ts}',
    __dirname + '/../../**/*.entity.{js,ts}',
    Payment
  ],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
