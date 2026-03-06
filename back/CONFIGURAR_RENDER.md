# Configuración de Render para evitar errores de memoria

## Problema
El build en Render falla con "out of memory" porque el proceso de compilación usa demasiada memoria.

## Solución

### 1. Configurar Build Command en Render

En el dashboard de Render, ve a tu servicio y configura:

**Build Command:**
```bash
npm install && NODE_OPTIONS=--max-old-space-size=1024 npm run build
```

**Start Command:**
```bash
npm run start:prod
```

⚠️ **IMPORTANTE**: Asegúrate de usar `start:prod` y NO `start:dev`. El comando `start:dev` es solo para desarrollo local y no funciona en producción.

### 2. Variables de Entorno en Render

Asegúrate de tener estas variables configuradas en Render:

```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
```

### 3. Si el problema persiste

Si aún tienes problemas de memoria, puedes:

**Opción A: Usar build simplificado**
Cambia el Build Command a:
```bash
npm install && NODE_OPTIONS=--max-old-space-size=1024 npm run build:render
```

**Opción B: Build en dos pasos**
1. Build Command: `npm install`
2. Luego en un script separado: `NODE_OPTIONS=--max-old-space-size=1024 npm run build`

### 4. Verificar logs

Después del deploy, verifica los logs de Render. Deberías ver:
- `✅ UploadService inicializado correctamente` (si las variables R2 están configuradas)
- `Application running on port 3000`

Si ves errores de memoria, el build command necesita más memoria o hay que optimizar más el código.

### 5. Variables de Entorno R2 (Importante)

No olvides configurar estas variables en Render:

```
R2_ACCOUNT_ID=24be27c79ff56584aefae46859556b78
R2_ACCESS_KEY_ID=ebf55278a7ae3635c7fcc8cc344ec555
R2_SECRET_ACCESS_KEY=9afdac4c371eefd349f398f2cd82ff5fb4ae2e50042d5838eb4ac17a0a97b5ac
R2_BUCKET_NAME=futbolink-media
R2_PUBLIC_URL=https://pub-a77ca935b7d648d68ee649162076971b.r2.dev
```

## Optimizaciones aplicadas

1. ✅ `.npmrc` configurado con `node-options=--max-old-space-size=1024`
2. ✅ `nest-cli.json` optimizado para usar SWC sin type checking
3. ✅ `tsconfig.json` con `incremental: false` para reducir memoria
4. ✅ Build command optimizado para Render
