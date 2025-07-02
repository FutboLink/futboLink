#!/bin/bash

# Este script está diseñado para ser ejecutado en el servidor de producción
# o para ser usado con el servicio de despliegue de Render.com

echo "Iniciando despliegue de migración para campos de aplicación por reclutador..."

# Compilar el backend
echo "Compilando el backend..."
cd back
npm run build

# Crear un archivo de migración temporal que use las variables de entorno de producción
echo "Creando script de migración para producción..."
cat > src/database/run-recruiter-application-migration-prod.ts << 'EOL'
import { DataSource } from 'typeorm';
import { AddRecruiterApplicationFields1723000000000 } from './migrations/1723000000000-AddRecruiterApplicationFields';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a la base de datos
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [],
  migrations: [AddRecruiterApplicationFields1723000000000],
  synchronize: false,
  logging: true,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    // Ejecutar la migración
    console.log('Ejecutando migración para añadir campos de aplicación por reclutador...');
    await AppDataSource.runMigrations();
    console.log('Migración completada con éxito');

    // Cerrar la conexión
    await AppDataSource.destroy();
    console.log('Conexión a la base de datos cerrada');
    
    // Salir con código de éxito
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la función
runMigration();
EOL

# Ejecutar el script de migración
echo "Ejecutando migración en producción..."
npx ts-node src/database/run-recruiter-application-migration-prod.ts

# Verificar si la migración se ejecutó correctamente
if [ $? -eq 0 ]; then
    echo "Migración ejecutada correctamente en producción."
else
    echo "Error al ejecutar la migración en producción."
    exit 1
fi

echo "Despliegue completado con éxito." 