#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar la migración
echo "Ejecutando migración para añadir campos de aplicación por reclutador..."
npx ts-node src/database/run-recruiter-application-migration.ts

# Compilar el backend
echo "Compilando el backend..."
npm run build

# Reiniciar el servicio
echo "Reiniciando el servicio..."
pm2 restart futbolink-backend

echo "Migración completada y aplicada." 