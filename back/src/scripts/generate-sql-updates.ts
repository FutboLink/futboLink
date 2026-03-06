/**
 * Script para generar un archivo SQL con todas las actualizaciones de URLs
 * 
 * Este script lee el upload-to-r2-log.json y genera un archivo SQL
 * que puedes ejecutar directamente en Render o en tu cliente de PostgreSQL.
 * 
 * Ejecución:
 *   cd back
 *   npx ts-node src/scripts/generate-sql-updates.ts
 */

import * as fs from 'fs';
import { join } from 'path';

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

function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

function generateSqlUpdate(result: UploadResult): string {
  if (!result.success || !result.newUrl) return '';
  
  const { table, field, id } = result.record;
  const escapedNewUrl = escapeSqlString(result.newUrl);
  
  // Construir query según la tabla y campo
  if (field === 'imageUrl') {
    // Tabla News usa imageUrl
    return `UPDATE "News" SET "imageUrl" = '${escapedNewUrl}' WHERE id = '${id}';`;
  } else if (field === 'image') {
    // Tabla curso usa image
    return `UPDATE curso SET image = '${escapedNewUrl}' WHERE id = '${id}';`;
  } else {
    // Otras tablas usan camelCase con comillas
    const fieldName = field === 'imgUrl' ? 'imgUrl' : 
                     field === 'attachmentUrl' ? 'attachmentUrl' : 
                     field === 'cv' ? 'cv' : field;
    return `UPDATE "${table}" SET "${fieldName}" = '${escapedNewUrl}' WHERE id = '${id}';`;
  }
}

async function generateSql() {
  console.log('📝 Generando archivo SQL con actualizaciones de URLs...\n');
  
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
  
  // Generar SQL
  const sqlStatements: string[] = [];
  sqlStatements.push('-- Script generado automáticamente para actualizar URLs de Cloudinary a R2');
  sqlStatements.push(`-- Fecha: ${new Date().toISOString()}`);
  sqlStatements.push(`-- Total de actualizaciones: ${uploadResults.length}`);
  sqlStatements.push('');
  sqlStatements.push('BEGIN;');
  sqlStatements.push('');
  
  let count = 0;
  for (const result of uploadResults) {
    const sql = generateSqlUpdate(result);
    if (sql) {
      sqlStatements.push(sql);
      count++;
    }
  }
  
  sqlStatements.push('');
  sqlStatements.push('COMMIT;');
  sqlStatements.push('');
  sqlStatements.push(`-- Total de statements ejecutados: ${count}`);
  
  // Guardar archivo SQL
  const sqlPath = join(__dirname, '../../update-urls-to-r2.sql');
  fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Archivo SQL generado exitosamente');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📄 Archivo: ${sqlPath}`);
  console.log(`📊 Total de actualizaciones: ${count}`);
  console.log('');
  console.log('📝 INSTRUCCIONES PARA EJECUTAR:');
  console.log('');
  console.log('Opción 1: Desde Render Dashboard');
  console.log('   1. Ve a https://dashboard.render.com');
  console.log('   2. Selecciona tu base de datos PostgreSQL');
  console.log('   3. Ve a "Connect" → "External Connection"');
  console.log('   4. Copia el comando de conexión');
  console.log('   5. Ejecuta: psql "tu-connection-string" < update-urls-to-r2.sql');
  console.log('');
  console.log('Opción 2: Desde línea de comandos (si tienes psql instalado)');
  console.log('   psql "postgresql://usuario:contraseña@host:puerto/db" < update-urls-to-r2.sql');
  console.log('');
  console.log('Opción 3: Ejecutar statements individualmente');
  console.log('   Abre el archivo SQL y copia/pega los statements en tu cliente SQL');
  console.log('');
}

generateSql().catch(err => {
  console.error('❌ Error no controlado:', err);
  process.exit(1);
});
