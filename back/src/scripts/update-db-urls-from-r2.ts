/**
 * Script para actualizar las URLs en la base de datos desde el log de R2
 * 
 * Este script lee el upload-to-r2-log.json y actualiza todas las URLs
 * en la base de datos, reemplazando las de Cloudinary por las de R2.
 * 
 * Ejecución:
 *   cd back
 *   npx ts-node src/scripts/update-db-urls-from-r2.ts
 */

import * as fs from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env.development') });
dotenv.config({ path: join(__dirname, '../../futboLink.env') });
if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
  dotenv.config({ path: join(__dirname, '../../.env') });
}

interface UploadResult {
  success: boolean;
  oldUrl: string;
  newUrl?: string;
  error?: string;
  record: {
    table: string;
    field: string;
    id: string;
    url: string;
    fileType: string;
  };
}

interface UploadLog {
  uploadDate: string;
  summary: {
    total: number;
    uploaded: number;
    failed: number;
    dbUpdated: number;
    dbFailed: number;
    elapsedSeconds: string;
  };
  results: UploadResult[];
}

// Función para actualizar URLs en la base de datos
async function updateDatabaseUrls(
  client: Client,
  uploadResults: UploadResult[]
): Promise<{ updated: number; failed: number }> {
  let updated = 0;
  let failed = 0;
  
  for (const result of uploadResults) {
    if (!result.success || !result.newUrl) continue;
    
    const { table, field, id } = result.record;
    
    try {
      // Construir query según la tabla y campo
      let query: string;
      let params: any[];
      
      if (field === 'imageUrl') {
        // Tabla News usa imageUrl
        query = `UPDATE "News" SET "imageUrl" = $1 WHERE id = $2`;
        params = [result.newUrl, id];
      } else if (field === 'image') {
        // Tabla curso usa image
        query = `UPDATE curso SET image = $1 WHERE id = $2`;
        params = [result.newUrl, id];
      } else {
        // Otras tablas usan camelCase con comillas
        const fieldName = field === 'imgUrl' ? 'imgUrl' : 
                         field === 'attachmentUrl' ? 'attachmentUrl' : 
                         field === 'cv' ? 'cv' : field;
        query = `UPDATE "${table}" SET "${fieldName}" = $1 WHERE id = $2`;
        params = [result.newUrl, id];
      }
      
      await client.query(query, params);
      updated++;
    } catch (error: any) {
      console.error(`Error actualizando ${table}.${field} (${id}):`, error.message);
      failed++;
    }
  }
  
  return { updated, failed };
}

async function updateUrls() {
  console.log('💾 Actualizando URLs en la base de datos desde R2...\n');
  
  // Leer log de subida
  const logPath = join(__dirname, '../../upload-to-r2-log.json');
  if (!fs.existsSync(logPath)) {
    console.error('❌ Error: No se encontró upload-to-r2-log.json');
    console.error('   Ejecuta primero: npx ts-node src/scripts/upload-to-r2.ts');
    process.exit(1);
  }
  
  console.log('📖 Leyendo log de subida a R2...');
  const logData: UploadLog = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  const uploadResults = logData.results.filter(r => r.success && r.newUrl);
  
  console.log(`✅ Encontrados ${uploadResults.length} URLs para actualizar\n`);
  
  // Conectar a base de datos (usando la misma lógica que extract-cloudinary-urls.ts)
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl && process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    let host = process.env.DB_HOST;
    const port = process.env.DB_PORT || '5432';
    const database = process.env.DB_NAME;
    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    
    // Si el hostname parece ser de Render pero está incompleto, agregar el dominio
    if (host.startsWith('dpg-') && host.endsWith('-a') && !host.includes('render.com')) {
      host = `${host}.oregon-postgres.render.com`;
    }
    
    // Construir la URL de conexión
    databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }
  
  if (!databaseUrl && !process.env.DB_NAME) {
    console.error('❌ Error: No se encontró configuración de base de datos');
    process.exit(1);
  }
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl ? { rejectUnauthorized: false } : false,
  });
  
  try {
    await client.connect();
    console.log('✅ Conexión establecida con la base de datos\n');
    
    // Actualizar URLs
    console.log('🔄 Actualizando URLs en la base de datos...');
    const result = await updateDatabaseUrls(client, uploadResults);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ URLs actualizadas: ${result.updated}`);
    if (result.failed > 0) {
      console.log(`❌ Fallidos: ${result.failed}`);
    }
    console.log('');
    
    // Actualizar el log con el resultado
    logData.summary.dbUpdated = result.updated;
    logData.summary.dbFailed = result.failed;
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf-8');
    console.log(`✅ Log actualizado en: ${logPath}`);
    
    await client.end();
    console.log('\n✅ Proceso completado.');
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

updateUrls().catch(err => {
  console.error('❌ Error no controlado:', err);
  process.exit(1);
});
