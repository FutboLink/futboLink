/**
 * Script para descargar todas las imágenes/archivos de Cloudinary
 * 
 * Este script lee el archivo cloudinary-urls-export.json y descarga
 * cada archivo desde Cloudinary, guardándolo localmente para luego
 * subirlo a la nueva plataforma de almacenamiento.
 * 
 * Ejecución:
 *   cd back
 *   npx ts-node src/scripts/download-cloudinary-files.ts
 * 
 * Requisitos:
 *   - Archivo cloudinary-urls-export.json generado previamente
 *   - Node.js con soporte para fetch (v18+) o instalar node-fetch
 */

import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import * as https from 'https';
import * as http from 'http';

interface CloudinaryRecord {
  table: string;
  field: string;
  id: string;
  url: string;
  fileType: 'image' | 'pdf' | 'document' | 'unknown';
}

interface ExportData {
  exportDate: string;
  summary: Record<string, any>;
  totalCloudinaryUrls: number;
  breakdown: { images: number; pdfs: number; documents: number };
  records: CloudinaryRecord[];
}

interface DownloadResult {
  success: boolean;
  url: string;
  localPath?: string;
  error?: string;
  size?: number;
}

// Configuración
const BATCH_SIZE = 10; // Descargar 10 archivos a la vez
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos entre reintentos
const DOWNLOAD_DIR = join(__dirname, '../../cloudinary-downloads');

// Crear directorio de descargas si no existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Función para descargar un archivo
function downloadFile(url: string, outputPath: string): Promise<{ success: boolean; size?: number; error?: string }> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(outputPath);
    let downloadedBytes = 0;
    
    const request = protocol.get(url, (response) => {
      // Si hay redirección, seguirla
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          file.close();
          fs.unlinkSync(outputPath);
          return downloadFile(response.headers.location, outputPath).then(resolve);
        }
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath);
        resolve({ success: false, error: `HTTP ${response.statusCode}` });
        return;
      }
      
      response.pipe(file);
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
      });
      
      file.on('finish', () => {
        file.close();
        resolve({ success: true, size: downloadedBytes });
      });
    });
    
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      resolve({ success: false, error: err.message });
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Función para obtener extensión del archivo desde URL
function getFileExtension(url: string, fileType: string): string {
  // Intentar extraer extensión de la URL
  const urlMatch = url.match(/\.([a-z0-9]+)(\?|$)/i);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }
  
  // Fallback según tipo de archivo
  if (fileType === 'pdf') return 'pdf';
  if (fileType === 'document') {
    if (url.includes('.docx')) return 'docx';
    if (url.includes('.doc')) return 'doc';
  }
  if (fileType === 'image') {
    // Cloudinary URLs pueden tener formato /image/upload/v123/.../image.jpg
    if (url.includes('/image/upload')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
        return lastPart.split('.')[1].toLowerCase();
      }
    }
    return 'jpg'; // Default para imágenes
  }
  
  return 'bin';
}

// Función para generar nombre de archivo único
function generateFileName(record: CloudinaryRecord, index: number): string {
  const ext = getFileExtension(record.url, record.fileType);
  // Usar tabla, campo e ID para crear nombre único
  const safeId = record.id.substring(0, 8);
  return `${record.table}_${record.field}_${safeId}_${index}.${ext}`;
}

// Función para descargar un batch de archivos
async function downloadBatch(
  records: CloudinaryRecord[],
  startIndex: number,
  results: DownloadResult[]
): Promise<void> {
  const batch = records.slice(startIndex, startIndex + BATCH_SIZE);
  const promises = batch.map(async (record, batchIndex) => {
    const globalIndex = startIndex + batchIndex;
    const fileName = generateFileName(record, globalIndex);
    const outputPath = join(DOWNLOAD_DIR, fileName);
    
    // Si el archivo ya existe, saltarlo
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      results[globalIndex] = {
        success: true,
        url: record.url,
        localPath: outputPath,
        size: stats.size,
      };
      return;
    }
    
    let lastError: string | undefined;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const result = await downloadFile(record.url, outputPath);
      
      if (result.success) {
        results[globalIndex] = {
          success: true,
          url: record.url,
          localPath: outputPath,
          size: result.size,
        };
        return;
      }
      
      lastError = result.error;
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
    
    results[globalIndex] = {
      success: false,
      url: record.url,
      error: lastError || 'Unknown error',
    };
  });
  
  await Promise.all(promises);
}

// Función principal
async function downloadAllFiles() {
  console.log('📥 Iniciando descarga de archivos de Cloudinary...\n');
  
  const exportPath = join(__dirname, '../../cloudinary-urls-export.json');
  
  if (!fs.existsSync(exportPath)) {
    console.error('❌ Error: No se encontró el archivo cloudinary-urls-export.json');
    console.error(`   Buscado en: ${exportPath}`);
    console.error('   Ejecuta primero: npx ts-node src/scripts/extract-cloudinary-urls.ts');
    process.exit(1);
  }
  
  console.log('📖 Leyendo archivo de exportación...');
  const exportData: ExportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
  const records = exportData.records;
  
  console.log(`✅ Encontrados ${records.length} archivos para descargar\n`);
  console.log(`📁 Directorio de descarga: ${DOWNLOAD_DIR}\n`);
  
  const results: DownloadResult[] = new Array(records.length);
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);
  
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  let totalSize = 0;
  
  const startTime = Date.now();
  
  // Descargar en batches
  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * BATCH_SIZE;
    const batchNum = i + 1;
    
    console.log(`📦 Procesando batch ${batchNum}/${totalBatches} (archivos ${startIndex + 1}-${Math.min(startIndex + BATCH_SIZE, records.length)})...`);
    
    await downloadBatch(records, startIndex, results);
    
    // Actualizar contadores
    for (let j = startIndex; j < Math.min(startIndex + BATCH_SIZE, records.length); j++) {
      const result = results[j];
      if (result) {
        if (result.success) {
          if (result.size === undefined || result.size === 0) {
            skipped++;
          } else {
            downloaded++;
            totalSize += result.size || 0;
          }
        } else {
          failed++;
        }
      }
    }
    
    const progress = ((i + 1) / totalBatches * 100).toFixed(1);
    console.log(`   ✅ Progreso: ${progress}% | Descargados: ${downloaded} | Fallidos: ${failed} | Omitidos: ${skipped}`);
    
    // Pequeña pausa entre batches para no sobrecargar
    if (i < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE DESCARGA');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Descargados exitosamente: ${downloaded}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`⏭️  Omitidos (ya existían): ${skipped}`);
  console.log(`💾 Tamaño total descargado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`⏱️  Tiempo total: ${elapsed} segundos`);
  console.log('');
  
  // Guardar log de resultados
  const logPath = join(__dirname, '../../download-log.json');
  const logData = {
    downloadDate: new Date().toISOString(),
    summary: {
      total: records.length,
      downloaded,
      failed,
      skipped,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      elapsedSeconds: elapsed,
    },
    results: results.map((r, i) => ({
      index: i,
      record: records[i],
      ...r,
    })),
  };
  
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf-8');
  console.log(`✅ Log guardado en: ${logPath}`);
  
  // Guardar lista de fallidos para reintentar
  const failedUrls = results
    .map((r, i) => ({ result: r, record: records[i] }))
    .filter(({ result }) => !result.success)
    .map(({ record }) => record.url);
  
  if (failedUrls.length > 0) {
    const failedPath = join(__dirname, '../../failed-downloads.txt');
    fs.writeFileSync(failedPath, failedUrls.join('\n'), 'utf-8');
    console.log(`⚠️  ${failedUrls.length} URLs fallidas guardadas en: ${failedPath}`);
    console.log('   Puedes reintentar descargarlas manualmente o ejecutar el script nuevamente.');
  }
  
  console.log('\n✅ Descarga completada.');
}

downloadAllFiles().catch(err => {
  console.error('❌ Error no controlado:', err);
  process.exit(1);
});
