/**
 * Script para extraer todas las URLs de Cloudinary de la base de datos
 * 
 * Este script consulta todas las tablas que almacenan URLs de archivos
 * (imagenes, CVs, documentos) y genera un JSON con el inventario completo.
 * 
 * Ejecución:
 *   cd back
 *   npx ts-node src/scripts/extract-cloudinary-urls.ts
 * 
 * Requisitos:
 *   - DATABASE_URL configurado en .env.development o .env
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

// Cargar variables de entorno (intentar múltiples archivos)
dotenv.config({ path: join(__dirname, '../../.env.development') });
dotenv.config({ path: join(__dirname, '../../futboLink.env') }); // Archivo de Render
if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
  dotenv.config({ path: join(__dirname, '../../.env') });
}

interface CloudinaryRecord {
  table: string;
  field: string;
  id: string;
  url: string;
  fileType: 'image' | 'pdf' | 'document' | 'unknown';
}

function detectFileType(url: string): CloudinaryRecord['fileType'] {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  if (lower.endsWith('.pdf') || lower.includes('/pdf/') || lower.includes('/raw/')) return 'pdf';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'document';
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/)) return 'image';
  if (lower.includes('/image/upload')) return 'image';
  return 'unknown';
}

function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.includes('cloudinary');
}

async function extractUrls() {
  console.log('🔍 Extrayendo URLs de Cloudinary de la base de datos...\n');

  // Construir DATABASE_URL si no existe pero tenemos variables individuales
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl && process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    let host = process.env.DB_HOST;
    const port = process.env.DB_PORT || '5432';
    const database = process.env.DB_NAME;
    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    
    // Si el hostname parece ser de Render pero está incompleto, agregar el dominio
    // Los hostnames de Render suelen ser: dpg-xxxxx-a.oregon-postgres.render.com
    if (host.startsWith('dpg-') && host.endsWith('-a') && !host.includes('render.com')) {
      host = `${host}.oregon-postgres.render.com`;
      console.log(`⚠️  Hostname incompleto detectado. Usando: ${host}`);
    }
    
    // Construir la URL de conexión
    databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    console.log('✅ Construyendo DATABASE_URL desde variables individuales...\n');
  }

  if (!databaseUrl && !process.env.DB_NAME) {
    console.error('❌ Error: No se encontró configuración de base de datos.\n');
    console.error('📝 INSTRUCCIONES PARA CONFIGURAR:\n');
    console.error('Opción 1: Crear archivo .env.development en /back/ con:');
    console.error('   DATABASE_URL="postgresql://usuario:contraseña@host:puerto/nombre_db"');
    console.error('   O las variables individuales:');
    console.error('   DB_HOST=...');
    console.error('   DB_NAME=...');
    console.error('   DB_USERNAME=...');
    console.error('   DB_PASSWORD=...');
    console.error('   DB_PORT=5432\n');
    console.error('Opción 2: Pasar como variable de entorno al ejecutar:');
    console.error('   DATABASE_URL="..." npx ts-node src/scripts/extract-cloudinary-urls.ts\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Conexión establecida con la base de datos\n');

    const allRecords: CloudinaryRecord[] = [];
    const summary: Record<string, { total: number; cloudinary: number; nonCloudinary: number; empty: number }> = {};

    // ──────────────────────────────────────────
    // 1. Tabla users - campo imgUrl (fotos de perfil)
    // ──────────────────────────────────────────
    console.log('📋 Consultando users.imgUrl (fotos de perfil)...');
    const usersImgResult = await client.query(
      `SELECT id, "imgUrl" as url FROM users WHERE "imgUrl" IS NOT NULL AND "imgUrl" != ''`
    );
    let cloudinaryCount = 0;
    let nonCloudinaryCount = 0;
    for (const row of usersImgResult.rows) {
      if (isCloudinaryUrl(row.url)) {
        allRecords.push({ table: 'users', field: 'imgUrl', id: row.id, url: row.url, fileType: detectFileType(row.url) });
        cloudinaryCount++;
      } else {
        nonCloudinaryCount++;
      }
    }
    summary['users.imgUrl'] = { total: usersImgResult.rowCount, cloudinary: cloudinaryCount, nonCloudinary: nonCloudinaryCount, empty: 0 };
    console.log(`   → ${usersImgResult.rowCount} registros con imgUrl, ${cloudinaryCount} de Cloudinary\n`);

    // ──────────────────────────────────────────
    // 2. Tabla users - campo cv (CVs/documentos)
    // ──────────────────────────────────────────
    console.log('📋 Consultando users.cv (CVs)...');
    const usersCvResult = await client.query(
      `SELECT id, cv as url FROM users WHERE cv IS NOT NULL AND cv != ''`
    );
    cloudinaryCount = 0;
    nonCloudinaryCount = 0;
    for (const row of usersCvResult.rows) {
      if (isCloudinaryUrl(row.url)) {
        allRecords.push({ table: 'users', field: 'cv', id: row.id, url: row.url, fileType: detectFileType(row.url) });
        cloudinaryCount++;
      } else {
        nonCloudinaryCount++;
      }
    }
    summary['users.cv'] = { total: usersCvResult.rowCount, cloudinary: cloudinaryCount, nonCloudinary: nonCloudinaryCount, empty: 0 };
    console.log(`   → ${usersCvResult.rowCount} registros con CV, ${cloudinaryCount} de Cloudinary\n`);

    // ──────────────────────────────────────────
    // 3. Tabla jobs - campo imgUrl
    // ──────────────────────────────────────────
    console.log('📋 Consultando jobs.imgUrl (imagenes de ofertas)...');
    const jobsResult = await client.query(
      `SELECT id, "imgUrl" as url FROM jobs WHERE "imgUrl" IS NOT NULL AND "imgUrl" != ''`
    );
    cloudinaryCount = 0;
    nonCloudinaryCount = 0;
    for (const row of jobsResult.rows) {
      if (isCloudinaryUrl(row.url)) {
        allRecords.push({ table: 'jobs', field: 'imgUrl', id: row.id, url: row.url, fileType: detectFileType(row.url) });
        cloudinaryCount++;
      } else {
        nonCloudinaryCount++;
      }
    }
    summary['jobs.imgUrl'] = { total: jobsResult.rowCount, cloudinary: cloudinaryCount, nonCloudinary: nonCloudinaryCount, empty: 0 };
    console.log(`   → ${jobsResult.rowCount} registros con imgUrl, ${cloudinaryCount} de Cloudinary\n`);

    // ──────────────────────────────────────────
    // 4. Tabla News - campo imageUrl
    // ──────────────────────────────────────────
    console.log('📋 Consultando News.imageUrl (imagenes de noticias)...');
    try {
      const newsResult = await client.query(
        `SELECT id, "imageUrl" as url FROM "News" WHERE "imageUrl" IS NOT NULL AND "imageUrl" != ''`
      );
      cloudinaryCount = 0;
      nonCloudinaryCount = 0;
      for (const row of newsResult.rows) {
        if (isCloudinaryUrl(row.url)) {
          allRecords.push({ table: 'News', field: 'imageUrl', id: row.id, url: row.url, fileType: detectFileType(row.url) });
          cloudinaryCount++;
        } else {
          nonCloudinaryCount++;
        }
      }
      summary['News.imageUrl'] = { total: newsResult.rowCount, cloudinary: cloudinaryCount, nonCloudinary: nonCloudinaryCount, empty: 0 };
      console.log(`   → ${newsResult.rowCount} registros con imageUrl, ${cloudinaryCount} de Cloudinary\n`);
    } catch (err) {
      console.log(`   ⚠️  Tabla News no encontrada o error: ${(err as Error).message}\n`);
      summary['News.imageUrl'] = { total: 0, cloudinary: 0, nonCloudinary: 0, empty: 0 };
    }

    // ──────────────────────────────────────────
    // 5. Tabla SuccessCases - campo imgUrl
    // ──────────────────────────────────────────
    console.log('📋 Consultando SuccessCases.imgUrl (casos de exito)...');
    try {
      const successResult = await client.query(
        `SELECT id, "imgUrl" as url FROM "SuccessCases" WHERE "imgUrl" IS NOT NULL AND "imgUrl" != ''`
      );
      cloudinaryCount = 0;
      nonCloudinaryCount = 0;
      for (const row of successResult.rows) {
        if (isCloudinaryUrl(row.url)) {
          allRecords.push({ table: 'SuccessCases', field: 'imgUrl', id: row.id, url: row.url, fileType: detectFileType(row.url) });
          cloudinaryCount++;
        } else {
          nonCloudinaryCount++;
        }
      }
      summary['SuccessCases.imgUrl'] = { total: successResult.rowCount, cloudinary: cloudinaryCount, nonCloudinary: nonCloudinaryCount, empty: 0 };
      console.log(`   → ${successResult.rowCount} registros con imgUrl, ${cloudinaryCount} de Cloudinary\n`);
    } catch (err) {
      console.log(`   ⚠️  Tabla SuccessCases no encontrada o error: ${(err as Error).message}\n`);
      summary['SuccessCases.imgUrl'] = { total: 0, cloudinary: 0, nonCloudinary: 0, empty: 0 };
    }

    // ──────────────────────────────────────────
    // 6. Tabla curso - campo image
    // ──────────────────────────────────────────
    console.log('📋 Consultando curso.image (imagenes de cursos)...');
    try {
      const cursoResult = await client.query(
        `SELECT id, image as url FROM curso WHERE image IS NOT NULL AND image != ''`
      );
      cloudinaryCount = 0;
      nonCloudinaryCount = 0;
      for (const row of cursoResult.rows) {
        if (isCloudinaryUrl(row.url)) {
          allRecords.push({ table: 'curso', field: 'image', id: row.id, url: row.url, fileType: detectFileType(row.url) });
          cloudinaryCount++;
        } else {
          nonCloudinaryCount++;
        }
      }
      summary['curso.image'] = { total: cursoResult.rowCount, cloudinary: cloudinaryCount, nonCloudinary: nonCloudinaryCount, empty: 0 };
      console.log(`   → ${cursoResult.rowCount} registros con image, ${cloudinaryCount} de Cloudinary\n`);
    } catch (err) {
      console.log(`   ⚠️  Tabla curso no encontrada o error: ${(err as Error).message}\n`);
      summary['curso.image'] = { total: 0, cloudinary: 0, nonCloudinary: 0, empty: 0 };
    }

    // ──────────────────────────────────────────
    // 7. Tabla verification_requests - campo attachmentUrl
    // ──────────────────────────────────────────
    console.log('📋 Consultando verification_requests.attachmentUrl...');
    try {
      const verificationResult = await client.query(
        `SELECT id, "attachmentUrl" as url FROM verification_requests WHERE "attachmentUrl" IS NOT NULL AND "attachmentUrl" != ''`
      );
      cloudinaryCount = 0;
      nonCloudinaryCount = 0;
      for (const row of verificationResult.rows) {
        if (isCloudinaryUrl(row.url)) {
          allRecords.push({ table: 'verification_requests', field: 'attachmentUrl', id: row.id, url: row.url, fileType: detectFileType(row.url) });
          cloudinaryCount++;
        } else {
          nonCloudinaryCount++;
        }
      }
      summary['verification_requests.attachmentUrl'] = { total: verificationResult.rowCount, cloudinary: cloudinaryCount, nonCloudinary: nonCloudinaryCount, empty: 0 };
      console.log(`   → ${verificationResult.rowCount} registros con attachmentUrl, ${cloudinaryCount} de Cloudinary\n`);
    } catch (err) {
      console.log(`   ⚠️  Tabla verification_requests no encontrada o error: ${(err as Error).message}\n`);
      summary['verification_requests.attachmentUrl'] = { total: 0, cloudinary: 0, nonCloudinary: 0, empty: 0 };
    }

    // ──────────────────────────────────────────
    // Resumen y exportación
    // ──────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN');
    console.log('═══════════════════════════════════════════════════════════');
    
    let totalCloudinary = 0;
    let totalImages = 0;
    let totalPdfs = 0;
    let totalDocs = 0;

    for (const [key, value] of Object.entries(summary)) {
      console.log(`  ${key}: ${value.cloudinary} de Cloudinary / ${value.total} total`);
      totalCloudinary += value.cloudinary;
    }

    for (const record of allRecords) {
      if (record.fileType === 'image') totalImages++;
      else if (record.fileType === 'pdf') totalPdfs++;
      else if (record.fileType === 'document') totalDocs++;
    }

    console.log('');
    console.log(`  TOTAL URLs de Cloudinary: ${totalCloudinary}`);
    console.log(`    - Imagenes: ${totalImages}`);
    console.log(`    - PDFs: ${totalPdfs}`);
    console.log(`    - Documentos: ${totalDocs}`);
    console.log(`    - Otros/desconocidos: ${totalCloudinary - totalImages - totalPdfs - totalDocs}`);
    console.log('');

    // Calcular tamaño estimado (para planificar el almacenamiento)
    console.log('💾 Estimación de almacenamiento:');
    console.log(`    - Imagenes (~200KB avg): ~${Math.round(totalImages * 200 / 1024)} MB`);
    console.log(`    - PDFs (~500KB avg): ~${Math.round(totalPdfs * 500 / 1024)} MB`);
    console.log(`    - Total estimado: ~${Math.round((totalImages * 200 + totalPdfs * 500 + totalDocs * 300) / 1024)} MB`);
    console.log('');

    // Exportar a JSON
    const outputPath = join(__dirname, '../../cloudinary-urls-export.json');
    const exportData = {
      exportDate: new Date().toISOString(),
      summary,
      totalCloudinaryUrls: totalCloudinary,
      breakdown: { images: totalImages, pdfs: totalPdfs, documents: totalDocs },
      records: allRecords,
    };

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    console.log(`✅ Exportado a: ${outputPath}`);
    console.log(`   (${allRecords.length} registros con URLs de Cloudinary)\n`);

    // También exportar solo las URLs únicas para descargar
    const uniqueUrls = [...new Set(allRecords.map(r => r.url))];
    const urlsOnlyPath = join(__dirname, '../../cloudinary-urls-list.txt');
    fs.writeFileSync(urlsOnlyPath, uniqueUrls.join('\n'), 'utf-8');
    console.log(`✅ Lista de URLs únicas: ${urlsOnlyPath}`);
    console.log(`   (${uniqueUrls.length} URLs únicas para descargar)\n`);

    await client.end();
    console.log('✅ Conexión cerrada. Script finalizado.');

  } catch (err) {
    console.error('❌ Error:', err);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

extractUrls().catch(err => {
  console.error('❌ Error no controlado:', err);
  process.exit(1);
});
