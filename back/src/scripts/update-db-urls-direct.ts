/**
 * Script para actualizar URLs usando la URL directa de Render
 * 
 * Este script usa la URL de Render directamente con sslmode=require en la URL,
 * evitando problemas de configuración SSL en el cliente.
 * 
 * Ejecución:
 *   cd back
 *   npx ts-node src/scripts/update-db-urls-direct.ts
 */

import * as fs from 'fs';
import { join } from 'path';
import { Client } from 'pg';

// URL directa de Render (con sslmode=require en la URL)
const RENDER_DB_URL = 'postgresql://futbolink:h9mt6zRAUM2eF1rUuhr7wLgpvGSjknRX@dpg-cvi5vrl2ng1s73a1kda0-a.oregon-postgres.render.com/futbolinkdb?sslmode=require';

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
  
  // Procesar en batches para no sobrecargar
  const BATCH_SIZE = 100;
  const totalBatches = Math.ceil(uploadResults.length / BATCH_SIZE);
  
  for (let i = 0; i < totalBatches; i++) {
    const batch = uploadResults.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const batchNum = i + 1;
    
    console.log(`🔄 Procesando batch ${batchNum}/${totalBatches} (${batch.length} actualizaciones)...`);
    
    for (const result of batch) {
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
        console.error(`   ❌ Error actualizando ${table}.${field} (${id.substring(0, 8)}...):`, error.message);
        failed++;
      }
    }
    
    const progress = ((i + 1) / totalBatches * 100).toFixed(1);
    console.log(`   ✅ Progreso: ${progress}% | Actualizados: ${updated} | Fallidos: ${failed}`);
  }
  
  return { updated, failed };
}

async function updateUrls() {
  console.log('💾 Actualizando URLs en la base de datos desde R2...\n');
  console.log('🔗 Usando URL directa de Render con SSL\n');
  
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
  
  // Conectar a base de datos usando URL directa de Render
  const client = new Client({
    connectionString: RENDER_DB_URL,
    // No configurar SSL aquí, ya está en la URL con sslmode=require
  });
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión establecida con la base de datos\n');
    
    // Actualizar URLs
    console.log('🔄 Actualizando URLs en la base de datos...\n');
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
    console.error('❌ Error:', error.message);
    console.error('\n💡 Si el error persiste, puedes:');
    console.error('   1. Generar el archivo SQL: npx ts-node src/scripts/generate-sql-updates.ts');
    console.error('   2. Ejecutar el SQL manualmente en Render Dashboard');
    await client.end().catch(() => {});
    process.exit(1);
  }
}

updateUrls().catch(err => {
  console.error('❌ Error no controlado:', err);
  process.exit(1);
});
