# Solución de Problemas de Cloudinary

## Error: "cloud_name is disabled"

Este error indica que la cuenta de Cloudinary con el cloud_name `dagcofbhm` está deshabilitada o suspendida.

### Posibles Causas

1. **Cuenta suspendida por falta de pago**: Si estás en un plan de pago, verifica que no haya problemas con el método de pago.
2. **Cuenta suspendida por violación de términos**: Revisa si hay alguna notificación en el dashboard de Cloudinary.
3. **Límite de uso excedido**: Si estás en el plan gratuito, verifica que no hayas excedido los límites.
4. **Problema con el Upload Preset**: El preset `FutboLink` puede no existir o estar mal configurado.

### Soluciones

#### 1. Verificar el estado de la cuenta en Cloudinary

1. Accede a tu dashboard de Cloudinary: https://cloudinary.com/console
2. Verifica el estado de tu cuenta
3. Revisa si hay notificaciones o alertas
4. Si la cuenta está suspendida, contacta con el soporte de Cloudinary

#### 2. Verificar el Upload Preset

1. En el dashboard de Cloudinary, ve a **Settings** > **Upload**
2. Verifica que existe un preset llamado `FutboLink`
3. Si no existe, créalo con las siguientes configuraciones:
   - **Preset name**: `FutboLink`
   - **Signing mode**: `Unsigned` (importante para subidas desde el frontend)
   - **Folder**: Puedes dejar vacío o especificar una carpeta
   - **Allowed formats**: Deja todos los formatos permitidos o especifica según necesites

#### 3. Verificar las variables de entorno

Asegúrate de que las siguientes variables estén configuradas en tu archivo `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dagcofbhm
NEXT_PUBLIC_UPLOAD_PRESET=FutboLink
```

**Importante**: 
- Las variables deben empezar con `NEXT_PUBLIC_` para que sean accesibles desde el cliente
- Después de cambiar las variables, reinicia el servidor de desarrollo

#### 4. Si necesitas crear una nueva cuenta de Cloudinary

Si la cuenta actual no se puede reactivar, puedes crear una nueva:

1. Crea una nueva cuenta en https://cloudinary.com/users/register/free
2. Obtén tu nuevo `cloud_name` del dashboard
3. Crea un nuevo Upload Preset sin firma
4. Actualiza las variables de entorno con los nuevos valores

### Verificación

Para verificar que todo está funcionando:

1. Reinicia el servidor de desarrollo de Next.js
2. Intenta subir una imagen desde la plataforma
3. Revisa la consola del navegador para ver los logs de Cloudinary
4. Si el error persiste, verifica los logs del servidor

### Mejoras Implementadas

Se ha mejorado el manejo de errores en los componentes de Cloudinary para mostrar mensajes más claros:

- `ImageUpload.tsx`: Detecta específicamente el error "cloud_name is disabled"
- `ImageUploadWithCrop.tsx`: Manejo mejorado de errores de Cloudinary
- `FileUpload.tsx`: Mensajes de error más descriptivos

Estos componentes ahora mostrarán mensajes específicos cuando:
- La cuenta de Cloudinary esté deshabilitada
- El upload preset no exista
- Haya un error de autenticación (401)
- Cualquier otro error de Cloudinary

### Contacto

Si el problema persiste después de seguir estos pasos, contacta al administrador del sistema o al soporte de Cloudinary.

