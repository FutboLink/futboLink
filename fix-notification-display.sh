#!/bin/bash

# Ejecutar la migración para actualizar el tipo enum de notificaciones
echo "Ejecutando correcciones en el backend..."
./fix-representation-notifications.sh

# Compilar el frontend
echo "Compilando el frontend..."
cd front
npm run build

# Reiniciar el servicio del frontend
echo "Reiniciando el servicio del frontend..."
pm2 restart futbolink-frontend

echo "Correcciones completadas. Verifica que las notificaciones aparezcan correctamente." 