import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UploadService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;
  private isConfigured: boolean = false;
  private useLocal: boolean = false;
  private localDir: string = path.join(process.cwd(), 'uploads');
  private localPublicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      const port = this.configService.get<number>('PORT') || 3000;
      this.localPublicUrl =
        this.configService.get<string>('LOCAL_UPLOAD_PUBLIC_URL') ||
        `http://localhost:${port}/uploads`;
      this.useLocal = true;
      this.isConfigured = true;
      console.warn('⚠️  R2 no configurado — usando almacenamiento LOCAL en disco');
      console.warn(`   Carpeta: ${this.localDir}`);
      console.warn(`   URL pública: ${this.localPublicUrl}`);
      console.warn('   ⚠️  Solo para desarrollo local. NO usar en producción.');
      return;
    }

    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'futbolink-media';
    this.publicUrl =
      this.configService.get<string>('R2_PUBLIC_URL') ||
      `https://pub-a77ca935b7d648d68ee649162076971b.r2.dev`;

    try {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isConfigured = true;
      console.log('✅ UploadService inicializado correctamente (R2)');
      console.log(`   Bucket: ${this.bucketName}`);
      console.log(`   Public URL: ${this.publicUrl}`);
    } catch (error) {
      console.error('❌ Error inicializando S3Client:', error);
      this.isConfigured = false;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: 'images' | 'cvs' | 'documents' = 'images',
  ): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase() || this.getDefaultExt(file.mimetype);
    const key = `${folder}/${randomUUID()}${ext}`;

    if (this.useLocal) {
      const fullPath = path.join(this.localDir, key);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file.buffer);
      return `${this.localPublicUrl}/${key}`;
    }

    if (!this.isConfigured || !this.s3Client) {
      throw new Error(
        'R2 no está configurado. Por favor, configura las variables de entorno: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY',
      );
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `${this.publicUrl}/${key}`;
  }

  private getDefaultExt(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };
    return map[mimetype] || '';
  }
}
