import { DataSource } from 'typeorm';

async function runMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: true,
  });

  try {
    console.log('🔗 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida');

    console.log('🔧 Agregando columna attachmentUrl a verification_requests...');
    await dataSource.query(`
      ALTER TABLE "verification_requests" 
      ADD COLUMN IF NOT EXISTS "attachmentUrl" text
    `);
    console.log('✅ Columna attachmentUrl agregada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexión cerrada');
    }
  }
}

runMigration();
