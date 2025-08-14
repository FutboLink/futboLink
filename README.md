# FutboLink

FutboLink es una plataforma integral para conectar jugadores de fútbol con oportunidades profesionales, ofreciendo servicios para jugadores, representantes y clubes.

## Descripción

FutboLink facilita la conexión entre el talento futbolístico y las oportunidades profesionales. La plataforma permite a los jugadores crear perfiles detallados, acceder a ofertas de trabajo, cursos de formación y noticias del sector. Los representantes pueden gestionar sus jugadores y los clubes pueden publicar ofertas de trabajo.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

### Backend (`/back`)

Desarrollado con NestJS, proporciona una API RESTful para todas las funcionalidades de la plataforma:

- Autenticación y gestión de usuarios
- Gestión de aplicaciones a ofertas de trabajo
- Sistema de notificaciones
- Procesamiento de pagos con Stripe
- Gestión de suscripciones
- Envío de correos electrónicos

### Frontend (`/front`)

Desarrollado con Next.js, ofrece una interfaz de usuario moderna y responsive:

- Panel de administración
- Perfiles de usuario (jugadores y representantes)
- Búsqueda de jugadores
- Visualización de ofertas de trabajo
- Sistema de aplicaciones
- Gestión de suscripciones
- Noticias y casos de éxito

## Características Principales

- **Sistema de Usuarios**: Diferentes roles (jugadores, representantes, administradores)
- **Ofertas de Trabajo**: Publicación y aplicación a ofertas del sector futbolístico
- **Notificaciones**: Sistema de alertas para aplicaciones y mensajes
- **Suscripciones**: Diferentes planes de suscripción con funcionalidades específicas
- **Pagos**: Integración con Stripe para gestionar pagos y suscripciones
- **Contenido**: Noticias, cursos y casos de éxito relacionados con el fútbol
- **Multilenguaje**: Soporte para diferentes idiomas

## Requisitos Técnicos

### Backend
- Node.js
- NestJS
- TypeORM
- PostgreSQL
- Stripe API

### Frontend
- Next.js
- React
- Tailwind CSS
- Context API para gestión de estado

## Instalación y Configuración

### Backend

```bash
cd back
npm install
cp .env.example .env  # Configurar variables de entorno
npm run migration:run
npm run start:dev
```

### Frontend

```bash
cd front
npm install
cp .env.example .env  # Configurar variables de entorno
npm run dev
```

## Scripts Útiles

### El Linter del Front esta configurado con Biomejs

- `npm run precommit` realiza el linter antes del commit despues de agregar los archivos modificados para mas informcion ver
- https://github.com/FutboLink/futboLink/pull/13

El proyecto incluye varios scripts para facilitar tareas comunes:

- `apply-applications-update.sh`: Actualiza la estructura de la tabla de aplicaciones
- `apply-notification-table.sh`: Configura la tabla de notificaciones
- `create-stripe-prices.js`: Configura los precios en Stripe

## Contribución

Para contribuir al proyecto:

1. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
2. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`)
3. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
4. Abre un Pull Request

## Licencia

Este proyecto es propiedad de FutboLink. Todos los derechos reservados. 