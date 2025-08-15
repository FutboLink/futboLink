# Funcionalidad de Aplicaciones de Reclutadores

## Descripción

Esta funcionalidad permite a los usuarios con rol `RECRUITER` postular a los jugadores de su portafolio a ofertas de trabajo específicas.

## Componentes

### RecruiterApplicationModal.tsx

Modal que permite a los reclutadores:
- Ver todos los jugadores en su portafolio
- Seleccionar uno o múltiples jugadores
- Escribir un mensaje explicando por qué postula a esos jugadores
- Enviar las aplicaciones al backend

### Integración en JobOffertDetails.tsx

Se añadió un botón "Postular jugadores de mi portafolio" que:
- Solo aparece para usuarios con rol `RECRUITER`
- No aparece si el reclutador es el dueño de la oferta
- Abre el modal de aplicaciones

## Flujo de Datos

1. **Frontend**: El reclutador selecciona jugadores y escribe un mensaje
2. **API Call**: Se envía `POST /applications/recruiter-apply` para cada jugador
3. **Backend**: Se valida que el jugador esté en la portafolio del reclutador
4. **Base de Datos**: Se crea una aplicación con campos especiales:
   - `appliedByRecruiter: true`
   - `recruiter`: referencia al reclutador
   - `recruiterMessage`: mensaje del reclutador
   - `player`: referencia al jugador

## Estructura de la Base de Datos

### Tabla `recruiter_portfolio`
- `recruiterId`: UUID del reclutador
- `playerId`: UUID del jugador
- `createdAt`: Fecha de cuando se añadió a la portafolio

### Tabla `application` (campos adicionales)
- `appliedByRecruiter`: Boolean
- `recruiterId`: UUID del reclutador (nullable)
- `recruiterMessage`: Texto del mensaje del reclutador

## Validaciones

- El jugador debe estar en la portafolio del reclutador
- No se pueden crear aplicaciones duplicadas para el mismo jugador y trabajo
- El reclutador debe existir y tener rol `RECRUITER`
- El trabajo debe existir y estar activo

## Estados de la Aplicación

Las aplicaciones creadas por reclutadores mantienen los mismos estados que las aplicaciones normales:
- `PENDING`: Pendiente de revisión
- `SHORTLISTED`: Seleccionado para evaluación
- `ACCEPTED`: Aceptado
- `REJECTED`: Rechazado

## Notificaciones

Cuando un reclutador postula a un jugador:
1. Se envía una notificación al jugador informando sobre la postulación
2. La aplicación aparece en la lista de postulantes del trabajo
3. Se puede identificar que fue creada por un reclutador por el campo `appliedByRecruiter`

## Uso

```tsx
import RecruiterApplicationModal from './RecruiterApplicationModal';

// En el componente padre
const [showModal, setShowModal] = useState(false);

<RecruiterApplicationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  jobId="job-uuid"
  jobTitle="Título de la oferta"
/>
``` 