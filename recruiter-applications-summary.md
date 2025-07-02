# Implementación de Aplicaciones por Reclutador

## Resumen

Se ha implementado la funcionalidad que permite a los reclutadores postular a jugadores de su cartera a ofertas de trabajo. Esta característica permite a los reclutadores representar activamente a sus jugadores, aumentando sus oportunidades laborales.

## Cambios Realizados

### Base de Datos

Se han añadido los siguientes campos a la tabla `application`:

1. `appliedByRecruiter` (boolean, not null, default false): Indica si la aplicación fue creada por un reclutador.
2. `recruiterId` (uuid, nullable): Almacena el ID del reclutador que creó la aplicación.
3. `recruiterMessage` (text, nullable): Almacena el mensaje del reclutador explicando por qué postula al jugador.
4. Se ha añadido una restricción de clave foránea `FK_application_recruiter` que vincula `recruiterId` con la tabla `users`.

### Backend

1. Se ha creado el DTO `RecruiterApplicationDto` para validar los datos de entrada.
2. Se ha implementado el método `applyForPlayer` en el servicio `ApplicationService` que:
   - Verifica que el reclutador existe y tiene el rol adecuado
   - Verifica que el jugador existe y tiene el rol adecuado
   - Verifica que el jugador está en la cartera del reclutador
   - Verifica que el trabajo existe
   - Comprueba que no haya aplicaciones duplicadas
   - Verifica la suscripción del jugador
   - Crea la aplicación con los campos específicos de reclutador
   - Incluye un mecanismo de fallback para sistemas donde la migración aún no se ha aplicado

3. Se ha implementado el endpoint `POST /applications/recruiter-apply` en el controlador `ApplicationController`.

4. Se ha modificado el método `listApplications` para manejar casos donde las columnas nuevas aún no existen en la base de datos, usando consultas SQL directas como fallback.

### Migración

Se ha creado y aplicado la migración `1723000000000-AddRecruiterApplicationFields` que añade los campos necesarios a la tabla `application`.

## Compatibilidad

El sistema mantiene la compatibilidad con versiones anteriores:

1. Si la migración no se ha aplicado, el servicio intentará crear la aplicación con los campos nuevos, pero si falla, utilizará el enfoque antiguo guardando la información del reclutador en el mensaje.

2. La función `listApplications` utiliza un mecanismo de fallback que usa consultas SQL directas si la consulta ORM falla debido a columnas faltantes.

## Notificaciones

Cuando un reclutador postula a un jugador, se envía una notificación al jugador informándole de la acción. Esta notificación incluye:

- Mensaje: "Tu representante [nombre] te ha postulado a una oferta: [título]"
- Tipo: PROFILE_VIEW (con metadatos adicionales para identificarlo como una aplicación por reclutador)
- Metadatos: jobId, jobTitle, applicationId, isApplicationByRecruiter

## Scripts de Utilidad

Se han creado los siguientes scripts para facilitar la implementación y verificación:

1. `run-recruiter-application-migration.sh`: Ejecuta la migración para añadir los campos necesarios a la tabla `application`.
2. `check-recruiter-applications.sh`: Verifica si existen aplicaciones creadas por reclutadores en el sistema.
3. `deploy-recruiter-application-migration.sh`: Script para desplegar la migración en producción.

## Estado Actual

La migración ha sido aplicada con éxito en la base de datos de producción. Actualmente no hay aplicaciones creadas por reclutadores en el sistema.

## Próximos Pasos

1. Monitorear el uso de la funcionalidad para detectar posibles problemas.
2. Considerar la posibilidad de añadir un tipo específico de notificación para aplicaciones creadas por reclutadores.
3. Implementar mejoras en la interfaz de usuario para mostrar claramente qué aplicaciones fueron creadas por reclutadores. 