# Solución al problema de autenticación de Gmail en FutboLink

## Problema detectado

Se ha detectado un error de autenticación al intentar enviar correos electrónicos desde la aplicación FutboLink:

```
Error sending email: Invalid login: 535-5.7.8 Username and Password not accepted.
```

Este error ocurre porque Google ha implementado políticas de seguridad más estrictas que rechazan el uso de contraseñas normales para aplicaciones de terceros.

## Solución: Usar contraseñas de aplicación

Para solucionar este problema, es necesario generar una "Contraseña de aplicación" específica para FutboLink:

### Paso 1: Activar la verificación en dos pasos

1. Accede a la cuenta de Gmail `futbolink.contacto@gmail.com`
2. Ve a [Seguridad de la cuenta de Google](https://myaccount.google.com/security)
3. En la sección "Acceso a Google", activa la "Verificación en dos pasos" si aún no está activada
4. Sigue las instrucciones para completar la configuración

### Paso 2: Generar una contraseña de aplicación

1. Una vez activada la verificación en dos pasos, ve a [Contraseñas de aplicación](https://myaccount.google.com/apppasswords)
2. En "Seleccionar aplicación", elige "Otra (nombre personalizado)"
3. Escribe "FutboLink" como nombre
4. Haz clic en "Generar"
5. Google generará una contraseña de 16 caracteres. **Cópiala inmediatamente** (no se volverá a mostrar)

### Paso 3: Actualizar la configuración de FutboLink

#### Opción 1: Usar el script automatizado

Hemos creado un script para actualizar automáticamente la contraseña:

```bash
# Desde la raíz del proyecto
chmod +x update-gmail-password.sh
./update-gmail-password.sh "tu-nueva-contraseña-de-aplicación"
```

#### Opción 2: Actualización manual

1. Abre el archivo `.env` en el directorio `back`
2. Busca la línea `MAIL_PASSWORD=...`
3. Reemplaza la contraseña actual por la nueva contraseña de aplicación
4. Guarda el archivo

### Paso 4: Reiniciar el servidor

```bash
# En entorno de desarrollo
cd back
npm run start:dev

# En producción (Render)
# Reinicia el servicio desde el panel de control de Render
```

## Verificación

Para verificar que la configuración funciona correctamente:

1. Intenta realizar una acción que envíe correos electrónicos (por ejemplo, seleccionar un candidato)
2. Revisa los logs del servidor para confirmar que no hay errores de autenticación
3. Verifica que el correo electrónico se haya recibido correctamente

## Notas adicionales

- Las contraseñas de aplicación son específicas para cada dispositivo/aplicación
- Si cambias la contraseña principal de la cuenta de Gmail, las contraseñas de aplicación seguirán funcionando
- Por seguridad, puedes revocar las contraseñas de aplicación que ya no uses desde la configuración de seguridad de Google

## Solución de problemas

Si continúas experimentando problemas:

1. Verifica que la cuenta `futbolink.contacto@gmail.com` no tenga restricciones adicionales
2. Asegúrate de que el acceso a aplicaciones menos seguras esté desactivado (ya no es necesario con contraseñas de aplicación)
3. Comprueba si hay algún bloqueo temporal por intentos fallidos de inicio de sesión
4. Revisa los logs del servidor para obtener más detalles sobre el error

Para obtener ayuda adicional, consulta la [documentación de Google sobre contraseñas de aplicación](https://support.google.com/accounts/answer/185833). 