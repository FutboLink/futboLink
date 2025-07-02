#!/bin/bash

# Navegar al directorio del backend
cd back

# Compilar el backend
echo "Compilando el backend..."
npm run build

# Reiniciar el servicio del backend
echo "Reiniciando el servicio del backend..."
pm2 restart futbolink-backend

# Navegar al directorio del frontend
cd ../front

# Compilar el frontend
echo "Compilando el frontend..."
npm run build

# Reiniciar el servicio del frontend
echo "Reiniciando el servicio del frontend..."
pm2 restart futbolink-frontend

echo "Solución alternativa aplicada. Ahora las solicitudes de representación deberían aparecer correctamente en las notificaciones." 