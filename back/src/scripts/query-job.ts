/**
 * Script para consultar información de una oferta de trabajo y su creador
 * 
 * Este script se conecta directamente a la base de datos PostgreSQL
 * para obtener información de una oferta por ID usando consultas SQL.
 * 
 * Ejecución:
 *   DATABASE_URL="..." node -r ts-node/register src/scripts/query-job.ts <jobId>
 * 
 * Ejemplo:
 *   DATABASE_URL="postgresql://..." node -r ts-node/register src/scripts/query-job.ts 5f8ff5b1-6880-4cfd-a2e5-dd3b35f25444
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { join } from 'path';

// Cargar variables de entorno (intentar .env.development primero, luego .env)
dotenv.config({ path: join(__dirname, '../../.env.development') });
if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
  dotenv.config({ path: join(__dirname, '../../.env') });
}

// Función principal
async function queryJob() {
  // Obtener argumentos de la línea de comandos
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: Debes proporcionar un ID de oferta.');
    console.error('Uso: npx ts-node src/scripts/query-job.ts <jobId>');
    console.error('Ejemplo: npx ts-node src/scripts/query-job.ts 5f8ff5b1-6880-4cfd-a2e5-dd3b35f25444');
    process.exit(1);
  }

  const jobId = args[0];
  console.log(`🔍 Consultando oferta con ID: ${jobId}\n`);
  
  try {
    // Verificar que tenemos configuración de base de datos
    if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
      console.error('❌ Error: No se encontró configuración de base de datos.');
      console.error('   Asegúrate de tener DATABASE_URL o variables DB_* configuradas en .env.development o .env');
      process.exit(1);
    }

    // Crear cliente de PostgreSQL
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    });
    
    await client.connect();
    console.log('✅ Conexión establecida con la base de datos\n');
    
    // Primero verificar qué columna existe para la foreign key
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      AND (column_name = 'recruiterId' OR column_name = 'recruiter_id')
      LIMIT 1
    `;
    const columnResult = await client.query(checkColumnQuery);
    
    let recruiterColumn = 'recruiterId'; // default
    if (columnResult.rows.length > 0) {
      recruiterColumn = columnResult.rows[0].column_name;
    }
    
    // Consultar la oferta con JOIN al usuario reclutador
    const jobQuery = `
      SELECT 
        j.id,
        j.title,
        j.location,
        j.salary,
        j."currencyType",
        j.moneda,
        j.position,
        j.category,
        j.sport,
        j."sportGenres",
        j.status,
        j."createdAt",
        j.description,
        u.id as recruiter_id,
        u.name as recruiter_name,
        u.lastname as recruiter_lastname,
        u.email as recruiter_email,
        u.phone as recruiter_phone,
        u.role as recruiter_role,
        u."nameAgency" as recruiter_nameAgency,
        u.location as recruiter_location,
        u."isEmailVerified" as recruiter_isEmailVerified,
        u."createdAt" as recruiter_createdAt
      FROM jobs j
      LEFT JOIN users u ON j."${recruiterColumn}" = u.id
      WHERE j.id = $1
    `;
    
    const result = await client.query(jobQuery, [jobId]);
    
    if (result.rows.length === 0) {
      console.error(`❌ Error: No se encontró una oferta con el ID: ${jobId}`);
      await client.end();
      process.exit(1);
    }

    const row = result.rows[0];

    // Mostrar información de la oferta
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 INFORMACIÓN DE LA OFERTA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`ID: ${row.id}`);
    console.log(`Título: ${row.title}`);
    console.log(`Ubicación: ${row.location}`);
    console.log(`Salario: ${row.salary} ${row.currencyType || row.moneda || ''}`);
    console.log(`Posición: ${row.position}`);
    console.log(`Categoría: ${row.category || 'N/A'}`);
    console.log(`Deporte: ${row.sport || 'N/A'}`);
    console.log(`Género: ${row.sportGenres || 'N/A'}`);
    console.log(`Estado: ${row.status}`);
    console.log(`Fecha de creación: ${row.createdAt}`);
    if (row.description) {
      console.log(`Descripción: ${row.description.substring(0, 200)}${row.description.length > 200 ? '...' : ''}`);
    }
    console.log('');

    // Mostrar información del reclutador que creó la oferta
    if (row.recruiter_id) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('👤 INFORMACIÓN DEL RECLUTADOR (CREADOR DE LA OFERTA)');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`ID: ${row.recruiter_id}`);
      console.log(`Nombre: ${row.recruiter_name} ${row.recruiter_lastname || ''}`);
      console.log(`Email: ${row.recruiter_email}`);
      console.log(`Teléfono: ${row.recruiter_phone || 'No disponible'}`);
      console.log(`Rol: ${row.recruiter_role}`);
      console.log(`Nombre de Agencia: ${row.recruiter_nameAgency || 'No disponible'}`);
      console.log(`Ubicación: ${row.recruiter_location || 'No disponible'}`);
      console.log(`Email Verificado: ${row.recruiter_isEmailVerified ? 'Sí' : 'No'}`);
      console.log(`Fecha de registro: ${row.recruiter_createdAt || 'No disponible'}`);
    } else {
      console.log('⚠️  Advertencia: Esta oferta no tiene un reclutador asociado.');
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Cerrar la conexión
    await client.end();
    console.log('✅ Consulta completada. Conexión cerrada.');
    
  } catch (err) {
    console.error('❌ Error durante la consulta:', err);
    process.exit(1);
  }
}

// Ejecutar la función principal
queryJob().catch(err => {
  console.error('❌ Error no controlado:', err);
  process.exit(1);
});
