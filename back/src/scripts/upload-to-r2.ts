/**
 * Script para subir todos los archivos descargados a Cloudflare R2
 * 
 * Este script lee el download-log.json y sube cada archivo a R2,
 * luego actualiza las URLs en la base de datos.
 * 
 * Ejecución:
 *   cd back
 *   npx ts-node src/scripts/upload-to-r2.ts
 * 
 * Requisitos:
 *   - Archivo download-log.json generado previamente
 *   - Variables de entorno R2 configuradas
 *   - Dependencias: @aws-sdk/client-s3 instalado
 */

import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env.development') });
dotenv.config({ path: join(__dirname, '../../futboLink.env') });
if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
  dotenv.config({ path: join(__dirname, '../../.env') });
}

interface DownloadResult {
  index: number;
  record: {
    table: string;
    field: string;
    id: string;
    url: string;
    fileType: string;
  };
  success: boolean;
  url: string;
  localPath?: string;
  error?: string;
  size?: number;
}

interface UploadResult {
  success: boolean;
  oldUrl: string;
  newUrl?: string;
  error?: string;
  record: DownloadResult['record'];
}

// Configuración R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'futbolink-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}`;

// Configuración de subida
const BATCH_SIZE = 5; // Subir 5 archivos a la vez
const DOWNLOAD_DIR = join(__dirname, '../../cloudinary-downloads');

// Inicializar cliente S3 para R2
function createS3Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('❌ Variables de entorno R2 no configuradas. Verifica R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// Función para obtener extensión del archivo
function getFileExtension(filePath: string): string {
  return path.extname(filePath).substring(1).toLowerCase() || 'bin';
}

// Función para generar nombre de archivo en R2
function generateR2Key(record: DownloadResult['record'], index: number, filePath: string): string {
  const ext = getFileExtension(filePath);
  // Organizar por tipo: images/, pdfs/, documents/
  const folder = record.fileType === 'pdf' ? 'pdfs' : 
                 record.fileType === 'document' ? 'documents' : 'images';
  
  // Usar tabla, campo e ID para crear nombre único
  const safeId = record.id.substring(0, 8);
  return `${folder}/${record.table}/${record.field}_${safeId}_${index}.${ext}`;
}

// Función para subir un archivo a R2
async function uploadFileToR2(
  s3Client: S3Client,
  localPath: string,
  r2Key: string,
  contentType?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Leer archivo
    const fileContent = fs.readFileSync(localPath);
    
    // Determinar content-type si no se proporciona
    let finalContentType = contentType;
    if (!finalContentType) {
      const ext = getFileExtension(localPath);
      const contentTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      finalContentType = contentTypes[ext] || 'application/octet-stream';
    }
    
    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: fileContent,
      ContentType: finalContentType,
      // Hacer público para lectura
      ACL: 'public-read',
    });
    
    await s3Client.send(command);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// Función para verificar si un archivo ya existe en R2
async function fileExistsInR2(s3Client: S3Client, r2Key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
    });
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

// Función para subir un batch de archivos
async function uploadBatch(
  s3Client: S3Client,
  results: DownloadResult[],
  startIndex: number,
  uploadResults: UploadResult[]
): Promise<void> {
  const batch = results.slice(startIndex, startIndex + BATCH_SIZE);
  const promises = batch.map(async (downloadResult, batchIndex) => {
    const globalIndex = startIndex + batchIndex;
    
    if (!downloadResult.success || !downloadResult.localPath) {
      uploadResults[globalIndex] = {
        success: false,
        oldUrl: downloadResult.url,
        error: 'Download failed or no local path',
        record: downloadResult.record,
      };
      return;
    }
    
    if (!fs.existsSync(downloadResult.localPath)) {
      uploadResults[globalIndex] = {
        success: false,
        oldUrl: downloadResult.url,
        error: 'Local file not found',
        record: downloadResult.record,
      };
      return;
    }
    
    const r2Key = generateR2Key(downloadResult.record, globalIndex, downloadResult.localPath);
    
    // Verificar si ya existe
    try {
      const exists = await fileExistsInR2(s3Client, r2Key);
      if (exists) {
        const newUrl = `${R2_PUBLIC_URL}/${r2Key}`;
        uploadResults[globalIndex] = {
          success: true,
          oldUrl: downloadResult.url,
          newUrl,
          record: downloadResult.record,
        };
        return;
      }
    } catch (error) {
      // Continuar con la subida si hay error al verificar
    }
    
    // Subir archivo
    const uploadResult = await uploadFileToR2(s3Client, downloadResult.localPath, r2Key);
    
    if (uploadResult.success) {
      const newUrl = `${R2_PUBLIC_URL}/${r2Key}`;
      uploadResults[globalIndex] = {
        success: true,
        oldUrl: downloadResult.url,
        newUrl,
        record: downloadResult.record,
      };
    } else {
      uploadResults[globalIndex] = {
        success: false,
        oldUrl: downloadResult.url,
        error: uploadResult.error,
        record: downloadResult.record,
      };
    }
  });
  
  await Promise.all(promises);
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

// Función principal
async function uploadAllFiles() {
  console.log('☁️  Iniciando subida de archivos a Cloudflare R2...\n');
  
  // Verificar variables de entorno
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('❌ Error: Variables de entorno R2 no configuradas.');
    console.error('   Necesitas configurar:');
    console.error('   - R2_ACCOUNT_ID');
    console.error('   - R2_ACCESS_KEY_ID');
    console.error('   - R2_SECRET_ACCESS_KEY');
    console.error('   - R2_BUCKET_NAME (opcional, default: futbolink-media)');
    console.error('   - R2_PUBLIC_URL (opcional, para dominio personalizado)');
    console.error('\n   Ver: back/CONFIGURAR_CLOUDFLARE_R2.md');
    process.exit(1);
  }
  
  // Leer log de descarga
  const logPath = join(__dirname, '../../download-log.json');
  if (!fs.existsSync(logPath)) {
    console.error('❌ Error: No se encontró download-log.json');
    console.error('   Ejecuta primero: npx ts-node src/scripts/download-cloudinary-files.ts');
    process.exit(1);
  }
  
  console.log('📖 Leyendo log de descarga...');
  const logData = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  const downloadResults: DownloadResult[] = logData.results;
  
  console.log(`✅ Encontrados ${downloadResults.length} archivos para subir\n`);
  console.log(`📦 Bucket: ${R2_BUCKET_NAME}`);
  console.log(`🌐 URL pública: ${R2_PUBLIC_URL}\n`);
  
  // Crear cliente S3
  const s3Client = createS3Client();
  
  // Función para conectar a la base de datos (solo cuando sea necesario)
  async function connectToDatabase(): Promise<Client> {
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
    
    if (!databaseUrl) {
      throw new Error('No se encontró configuración de base de datos');
    }
    
    const dbClient = new Client({
      connectionString: databaseUrl,
      ssl: databaseUrl ? { rejectUnauthorized: false } : false,
    });
    
    await dbClient.connect();
    return dbClient;
  }
  
  try {
    
    const uploadResults: UploadResult[] = new Array(downloadResults.length);
    const totalBatches = Math.ceil(downloadResults.length / BATCH_SIZE);
    
    let uploaded = 0;
    let failed = 0;
    let skipped = 0;
    
    const startTime = Date.now();
    
    // Subir en batches
    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * BATCH_SIZE;
      const batchNum = i + 1;
      
      console.log(`📤 Procesando batch ${batchNum}/${totalBatches} (archivos ${startIndex + 1}-${Math.min(startIndex + BATCH_SIZE, downloadResults.length)})...`);
      
      await uploadBatch(s3Client, downloadResults, startIndex, uploadResults);
      
      // Actualizar contadores
      for (let j = startIndex; j < Math.min(startIndex + BATCH_SIZE, downloadResults.length); j++) {
        const result = uploadResults[j];
        if (result) {
          if (result.success) {
            uploaded++;
          } else {
            failed++;
          }
        }
      }
      
      const progress = ((i + 1) / totalBatches * 100).toFixed(1);
      console.log(`   ✅ Progreso: ${progress}% | Subidos: ${uploaded} | Fallidos: ${failed}`);
      
      // Pequeña pausa entre batches
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE SUBIDA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Subidos exitosamente: ${uploaded}`);
    console.log(`❌ Fallidos: ${failed}`);
    console.log(`⏱️  Tiempo total: ${elapsed} segundos`);
    console.log('');
    
    // Actualizar base de datos (conectar solo ahora)
    console.log('💾 Conectando a la base de datos para actualizar URLs...');
    let dbClient: Client | null = null;
    let dbResult = { updated: 0, failed: 0 };
    
    try {
      dbClient = await connectToDatabase();
      console.log('✅ Conexión establecida con la base de datos\n');
      
      console.log('💾 Actualizando URLs en la base de datos...');
      dbResult = await updateDatabaseUrls(dbClient, uploadResults);
      console.log(`✅ Actualizados: ${dbResult.updated}`);
      if (dbResult.failed > 0) {
        console.log(`❌ Fallidos: ${dbResult.failed}`);
      }
      console.log('');
    } catch (dbError: any) {
      console.error('⚠️  Error al conectar/actualizar base de datos:', dbError.message);
      console.error('   Los archivos se subieron correctamente a R2, pero las URLs no se actualizaron.');
      console.error('   Puedes actualizar las URLs manualmente más tarde usando el log generado.');
      console.log('');
    } finally {
      if (dbClient) {
        await dbClient.end().catch(() => {});
      }
    }
    
    // Guardar log de resultados
    const uploadLogPath = join(__dirname, '../../upload-to-r2-log.json');
    const uploadLogData = {
      uploadDate: new Date().toISOString(),
      summary: {
        total: downloadResults.length,
        uploaded,
        failed,
        dbUpdated: dbResult.updated,
        dbFailed: dbResult.failed,
        elapsedSeconds: elapsed,
      },
      results: uploadResults,
    };
    
    fs.writeFileSync(uploadLogPath, JSON.stringify(uploadLogData, null, 2), 'utf-8');
    console.log(`✅ Log guardado en: ${uploadLogPath}`);
    
    // Guardar lista de fallidos
    const failedUploads = uploadResults
      .filter(r => !r.success)
      .map(r => ({ url: r.oldUrl, error: r.error, record: r.record }));
    
    if (failedUploads.length > 0) {
      const failedPath = join(__dirname, '../../failed-uploads.json');
      fs.writeFileSync(failedPath, JSON.stringify(failedUploads, null, 2), 'utf-8');
      console.log(`⚠️  ${failedUploads.length} subidas fallidas guardadas en: ${failedPath}`);
    }
    
    console.log('\n✅ Proceso completado.');
    console.log(`🌐 Tus archivos ahora están disponibles en: ${R2_PUBLIC_URL}`);
    
    if (dbResult.failed > 0 || dbResult.updated === 0) {
      console.log('\n⚠️  IMPORTANTE: Algunas URLs no se actualizaron en la base de datos.');
      console.log('   Revisa el log para ver qué URLs necesitan actualizarse manualmente.');
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadAllFiles().catch(err => {
  console.error('❌ Error no controlado:', err);
  process.exit(1);
});
