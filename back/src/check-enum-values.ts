import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/futbolink',
  entities: [],
  synchronize: false,
  logging: true,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function checkEnumValues() {
  try {
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Consultar los valores del enum
    const enumValues = await AppDataSource.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'notifications_type_enum'
      ORDER BY e.enumsortorder;
    `);

    console.log('Valores del enum notifications_type_enum:');
    console.log(enumValues);

    // Verificar si existe el valor REPRESENTATION_REQUEST
    const hasRepresentationRequest = enumValues.some(
      (row: any) => row.enumlabel === 'REPRESENTATION_REQUEST'
    );

    console.log('¿Incluye REPRESENTATION_REQUEST?', hasRepresentationRequest);

    // Consultar notificaciones de tipo REPRESENTATION_REQUEST
    const notifications = await AppDataSource.query(`
      SELECT id, message, type, "userId", "sourceUserId", metadata
      FROM notifications
      WHERE type = 'REPRESENTATION_REQUEST'
      LIMIT 5;
    `);

    console.log('Notificaciones de tipo REPRESENTATION_REQUEST:');
    console.log(notifications);

    // Cerrar la conexión
    await AppDataSource.destroy();
    console.log('Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('Error al verificar valores del enum:', error);
    process.exit(1);
  }
}

// Ejecutar la función
checkEnumValues(); 