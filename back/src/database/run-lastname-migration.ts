import { DataSource } from 'typeorm';
import { MakeLastnameNullable1755000000000 } from './migrations/1755000000000-MakeLastnameNullable';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'futbolink',
  synchronize: false,
  logging: true,
  entities: [],
  migrations: [],
});

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected successfully');

    const migration = new MakeLastnameNullable1755000000000();
    const queryRunner = AppDataSource.createQueryRunner();

    console.log('Running migration: MakeLastnameNullable...');
    await migration.up(queryRunner);
    console.log('Migration completed successfully');

    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();

