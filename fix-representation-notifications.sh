#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar la migración para actualizar el tipo enum de notificaciones
echo "Ejecutando migración para actualizar el tipo enum de notificaciones..."
npx ts-node src/database/run-notification-type-migration.ts

# Compilar el backend
echo "Compilando el backend..."
npm run build

# Reiniciar el servicio
echo "Reiniciando el servicio..."
pm2 restart futbolink-backend

echo "Corrección completada. Verifica que las notificaciones aparezcan correctamente." 