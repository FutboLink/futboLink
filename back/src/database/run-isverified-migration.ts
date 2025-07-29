import { DataSource } from 'typeorm';
import { AddIsVerifiedToUsers1753817759230 } from './migrations/1753817759230-AddIsVerifiedToUsers';

// Configuración de la conexión a la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://futbolink_user:HWrPKWxLhLMTnXzgTdKtaXCFBdtZDTDR@dpg-cnkdm1da73kc73dkd6k0-a.oregon-postgres.render.com/futbolink',
  entities: [],
  migrations: [AddIsVerifiedToUsers1753817759230],
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  try {
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Ejecutar la migración
    console.log('Ejecutando migración para agregar columna isVerified a usuarios...');
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