#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar el script de migración
echo "Ejecutando migración para actualizar el tipo enum de notificaciones..."
npx ts-node src/database/run-notification-type-migration.ts

echo "Migración completada." 