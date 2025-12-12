# Optimizaciones de Memoria para Render

## Problema
La aplicación estaba consumiendo más de 512MB de memoria en Render, causando fallos constantes.

## Optimizaciones Implementadas

### 1. Configuración de Next.js (`front/next.config.js`)
- ✅ **Habilitada optimización de imágenes**: Cambiado `unoptimized: false` (antes estaba en `true` en producción)
- ✅ **Configurados tamaños de imagen**: Agregados `deviceSizes` e `imageSizes` para optimizar el uso de memoria
- ✅ **Habilitada compresión**: `compress: true` para reducir el tamaño de las respuestas
- ✅ **SWC Minify**: Habilitado para minificación más eficiente
- ✅ **Eliminado archivo duplicado**: Removido `next.config.ts` que causaba conflictos

### 2. Límites de Memoria en Scripts (`front/package.json`)
- ✅ **Agregado `NODE_OPTIONS='--max-old-space-size=512'`** en scripts de build y start
- Esto limita el uso de memoria de Node.js a 512MB durante el build y runtime

### 3. Optimización del Componente PlayerSearch
- ✅ **Reducido tamaño de lotes**: De 50 a 30 usuarios por lote
- ✅ **Reducido número máximo de lotes**: De 4 a 2 (de 200 a 60 usuarios máximo en memoria)
- ✅ **Agregado cleanup en useEffect**: Implementado `AbortController` y flags `isMounted` para evitar memory leaks
- ✅ **Optimizada paginación**: Reducido límite de usuarios mostrados de 50 a 30

### 4. Cleanup de Memory Leaks
- ✅ **Agregado cleanup en todos los useEffect críticos**:
  - Verificación de suscripción
  - Búsqueda de jugadores
  - Cambios de página
  - Cambios de filtros

## Recomendaciones Adicionales para Render

### 1. Configuración en Render Dashboard
1. Ve a tu servicio en Render
2. En **Settings** → **Environment**:
   - Agrega la variable: `NODE_OPTIONS=--max-old-space-size=512`
3. En **Settings** → **Build & Deploy**:
   - Verifica que el Build Command sea: `cd front && npm install && npm run build`
   - Verifica que el Start Command sea: `cd front && npm start`

### 2. Considera Actualizar el Plan de Render
- Si el problema persiste, considera actualizar a un plan con más memoria (1GB o más)
- El plan gratuito tiene límite de 512MB que puede ser insuficiente para aplicaciones Next.js grandes

### 3. Monitoreo
- Revisa los logs de Render regularmente para detectar picos de memoria
- Considera usar herramientas de monitoreo como New Relic o Datadog

### 4. Optimizaciones Futuras
- **Implementar paginación del lado del servidor**: En lugar de cargar todos los usuarios, implementar paginación real
- **Lazy loading de imágenes**: Asegurar que todas las imágenes usen `loading="lazy"`
- **Code splitting**: Verificar que Next.js esté haciendo code splitting correctamente
- **Reducir bundle size**: Revisar dependencias innecesarias

### 5. Variables de Entorno Recomendadas
```bash
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1  # Desactiva telemetría de Next.js para ahorrar memoria
```

## Verificación

Después de desplegar estos cambios:
1. Monitorea el uso de memoria en Render Dashboard
2. Verifica que no haya errores de memoria en los logs
3. Prueba la funcionalidad de búsqueda de jugadores para asegurar que sigue funcionando correctamente

## Notas Importantes

- Las optimizaciones reducen la cantidad de datos cargados, lo que puede afectar la experiencia del usuario si hay muchos resultados
- Si necesitas mostrar más resultados, considera implementar paginación del lado del servidor
- El límite de 512MB es estricto en el plan gratuito de Render

