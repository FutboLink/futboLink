#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar la migración para actualizar el tipo enum de notificaciones
echo "Ejecutando migración para actualizar el tipo enum de notificaciones..."
npx ts-node src/database/run-notification-type-migration.ts

echo "Compilando el backend..."
npm run build

echo "Reiniciando el servicio..."
pm2 restart futbolink-backend

echo "Actualización completada." 