import { DataSource } from 'typeorm';
import { AddRecruiterPortfolio1722700000000 } from './migrations/1722700000000-AddRecruiterPortfolio';

// Configuración de la conexión a la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  url: 'postgres://futbolink_user:HWrPKWxLhLMTnXzgTdKtaXCFBdtZDTDR@dpg-cnkdm1da73kc73dkd6k0-a.oregon-postgres.render.com/futbolink',
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [],
  migrations: [AddRecruiterPortfolio1722700000000],
  synchronize: false,
  logging: true,
});

async function runMigration() {
  try {
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Ejecutar la migración
    console.log('Ejecutando migración para crear la tabla de cartera de reclutadores...');
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