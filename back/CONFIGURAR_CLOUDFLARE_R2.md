# Guía: Configurar Cloudflare R2

## Paso 1: Crear cuenta en Cloudflare (si no tienes)

1. Ve a https://dash.cloudflare.com/sign-up
2. Crea una cuenta gratuita (solo necesitas email)
3. Verifica tu email

## Paso 2: Crear un bucket R2

1. En el dashboard de Cloudflare, ve a **R2** en el menú lateral
2. Si es la primera vez, haz clic en **"Create bucket"**
3. Configura el bucket:
   - **Nombre**: `futbolink-media` (o el que prefieras)
   - **Location**: Elige la región más cercana a tus usuarios (ej: `Western North America`)
4. Haz clic en **"Create bucket"**

## Paso 3: Configurar acceso público (para servir imágenes)

1. Dentro de tu bucket, ve a **Settings**
2. En **"Public Access"**, haz clic en **"Allow Access"**
3. Esto permitirá que las imágenes sean accesibles públicamente

## Paso 4: Configurar CORS (para uploads desde el frontend)

1. En **Settings** del bucket, busca **"CORS Policy"**
2. Haz clic en **"Edit CORS Policy"**
3. Agrega esta configuración:

```json
[
  {
    "AllowedOrigins": [
      "https://futbolink.vercel.app",
      "https://futbolink.net",
      "https://www.futbolink.net",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Guarda los cambios

## Paso 5: Obtener credenciales de API

1. En el dashboard de Cloudflare, ve a **R2** → **Manage R2 API Tokens**
2. Haz clic en **"Create API token"**
3. Configura el token:
   - **Permissions**: `Object Read & Write`
   - **TTL**: `No expiration` (o la duración que prefieras)
   - **Buckets**: Selecciona tu bucket `futbolink-media`
4. Haz clic en **"Create API Token"**
5. **IMPORTANTE**: Copia y guarda estas credenciales (solo se muestran una vez):
   - `Access Key ID` ebf55278a7ae3635c7fcc8cc344ec555
   - `Secret Access Key` 9afdac4c371eefd349f398f2cd82ff5fb4ae2e50042d5838eb4ac17a0a97b5ac
   - `Account ID` (lo encuentras en la parte superior del dashboard de R2)   24be27c79ff56584aefae46859556b78

## Paso 6: Configurar dominio personalizado (opcional pero recomendado)

Para tener URLs más limpias como `https://media.futbolink.net/imagen.jpg`:

1. En **Settings** del bucket, ve a **"Custom Domains"**
2. Haz clic en **"Connect Domain"**
3. Ingresa tu dominio (ej: `media.futbolink.net`)
4. Cloudflare te dará instrucciones para configurar el DNS
5. Una vez configurado, las URLs serán: `https://media.futbolink.net/archivo.jpg`

**Nota**: Si no configuras dominio personalizado, las URLs serán:
`https://[account-id].r2.cloudflarestorage.com/bucket-name/archivo.jpg`

https://pub-a77ca935b7d648d68ee649162076971b.r2.dev

## Paso 7: Instalar dependencias necesarias

En el directorio `/back`, instala el SDK de AWS (R2 es compatible con S3):

```bash
cd back
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Variables de entorno necesarias

Agrega estas variables a tu archivo `.env` o `futboLink.env`:

```bash
# Cloudflare R2
R2_ACCOUNT_ID=24be27c79ff56584aefae46859556b78
R2_ACCESS_KEY_ID=ebf55278a7ae3635c7fcc8cc344ec555
R2_SECRET_ACCESS_KEY=9afdac4c371eefd349f398f2cd82ff5fb4ae2e50042d5838eb4ac17a0a97b5ac
R2_BUCKET_NAME=futbolink-media
R2_PUBLIC_URL=https://pub-a77ca935b7d648d68ee649162076971b.r2.dev
# O si no tienes dominio personalizado:
# R2_PUBLIC_URL=https://[account-id].r2.cloudflarestorage.com/futbolink-media
```

## Verificación

Una vez configurado, puedes verificar que todo funciona ejecutando el script de prueba (que crearemos después).

## Límites del tier gratuito

- ✅ **10 GB de almacenamiento** (tienes ~1.5 GB, perfecto)
- ✅ **10 millones de lecturas/mes** (más que suficiente)
- ✅ **1 millón de escrituras/mes** (suficiente para tus 5000 usuarios)
- ✅ **Sin costos de egress** (descarga gratis, ilimitada)

¡Perfecto para tu caso de uso!
