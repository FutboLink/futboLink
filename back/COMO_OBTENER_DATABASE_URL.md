# Cómo obtener DATABASE_URL

## Opción 1: Desde Render (si tu backend está en Render)

1. Ve a https://dashboard.render.com
2. Inicia sesión con tu cuenta
3. Selecciona tu servicio de backend (NestJS)
4. En el menú lateral, ve a **"Environment"**
5. Busca la variable `DATABASE_URL`
6. Copia el valor completo

**Formato típico:**
```
postgresql://usuario:contraseña@host:puerto/nombre_db?sslmode=require
```

## Opción 2: Desde Supabase (si usas Supabase como base de datos)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Database**
4. En la sección **"Connection string"**, selecciona la pestaña **"URI"**
5. Copia la URL completa

**Formato típico:**
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

⚠️ **Importante:** Reemplaza `[PASSWORD]` con tu contraseña real de la base de datos.

## Opción 3: Crear archivo .env.development localmente

1. En el directorio `/back`, crea un archivo llamado `.env.development`
2. Agrega esta línea (reemplaza con tu URL real):

```bash
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/nombre_db?sslmode=require"
```

3. Guarda el archivo

## Opción 4: Pasar como variable de entorno al ejecutar

```bash
cd back
DATABASE_URL="postgresql://..." npx ts-node src/scripts/extract-cloudinary-urls.ts
```

## Verificar que funciona

Una vez configurado, ejecuta:

```bash
cd back
npx ts-node src/scripts/extract-cloudinary-urls.ts
```

Si ves `✅ Conexión establecida con la base de datos`, ¡está funcionando!
