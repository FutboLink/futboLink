import { DataSource } from 'typeorm';
import { UpdateNotificationTypeEnum1722900000000 } from './migrations/1722900000000-UpdateNotificationTypeEnum';

// Configuración de la conexión a la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/futbolink',
  entities: [],
  migrations: [UpdateNotificationTypeEnum1722900000000],
  synchronize: false,
  logging: true,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  try {
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Ejecutar la migración
    console.log('Ejecutando migración para actualizar el tipo enum de notificaciones...');
    await AppDataSource.runMigrations();
    console.log('Migración completada con éxito');

    // Cerrar la conexión
    await AppDataSource.destroy();
    console.log('Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la función
runMigration(); 