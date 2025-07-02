#!/bin/bash

# Script para ejecutar la migración que añade los campos de aplicación por reclutador
# Utiliza la URL de la base de datos proporcionada

echo "Iniciando migración para campos de aplicación por reclutador..."

# Crear un archivo temporal para la migración
cat > temp-migration.js << 'EOL'
const { Client } = require('pg');

// Configuración de la conexión
const client = new Client({
  connectionString: 'postgresql://futbolink:h9mt6zRAUM2eF1rUuhr7wLgpvGSjknRX@dpg-cvi5vrl2ng1s73a1kda0-a.oregon-postgres.render.com/futbolinkdb',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('Conexión establecida con la base de datos');

    // Verificar si las columnas ya existen
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'application' 
      AND column_name IN ('appliedByRecruiter', 'recruiterId', 'recruiterMessage')
    `;
    
    const columnsResult = await client.query(checkColumnsQuery);
    
    if (columnsResult.rows.length > 0) {
      console.log('Algunas columnas ya existen:');
      columnsResult.rows.forEach(row => {
        console.log(`- ${row.column_name}`);
      });
    }
    
    // Añadir campo para indicar si la aplicación fue creada por un reclutador
    console.log('Añadiendo columna appliedByRecruiter...');
    try {
      await client.query(`
        ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "appliedByRecruiter" BOOLEAN NOT NULL DEFAULT false
      `);
      console.log('Columna appliedByRecruiter añadida correctamente');
    } catch (error) {
      console.error('Error al añadir columna appliedByRecruiter:', error.message);
    }

    // Añadir campo para almacenar el ID del reclutador
    console.log('Añadiendo columna recruiterId...');
    try {
      await client.query(`
        ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "recruiterId" UUID
      `);
      console.log('Columna recruiterId añadida correctamente');
    } catch (error) {
      console.error('Error al añadir columna recruiterId:', error.message);
    }

    // Añadir campo para el mensaje del reclutador
    console.log('Añadiendo columna recruiterMessage...');
    try {
      await client.query(`
        ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "recruiterMessage" TEXT
      `);
      console.log('Columna recruiterMessage añadida correctamente');
    } catch (error) {
      console.error('Error al añadir columna recruiterMessage:', error.message);
    }

    // Añadir restricción de clave foránea para recruiterId
    console.log('Añadiendo restricción de clave foránea...');
    try {
      // Verificar si la restricción ya existe
      const constraintCheck = await client.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'application'
        AND constraint_name = 'FK_application_recruiter'
      `);
      
      if (constraintCheck.rows.length === 0) {
        await client.query(`
          ALTER TABLE "application" ADD CONSTRAINT "FK_application_recruiter" 
          FOREIGN KEY ("recruiterId") REFERENCES "users"("id") ON DELETE SET NULL
        `);
        console.log('Restricción de clave foránea añadida correctamente');
      } else {
        console.log('La restricción de clave foránea ya existe');
      }
    } catch (error) {
      console.error('Error al añadir restricción de clave foránea:', error.message);
    }

    console.log('Migración completada con éxito');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    // Cerrar la conexión
    await client.end();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la migración
runMigration();
EOL

# Instalar dependencias necesarias si no están instaladas
if ! command -v node &> /dev/null; then
  echo "Node.js no está instalado. Por favor, instala Node.js para continuar."
  exit 1
fi

# Instalar pg si no está instalado
if ! npm list -g pg &> /dev/null; then
  echo "Instalando el cliente PostgreSQL para Node.js..."
  npm install pg
fi

# Ejecutar el script de migración
echo "Ejecutando la migración..."
node temp-migration.js

# Limpiar archivos temporales
rm temp-migration.js

echo "Proceso de migración finalizado." 