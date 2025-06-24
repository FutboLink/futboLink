#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar el script de migración
echo "Ejecutando migración para crear la tabla de notificaciones..."
npx ts-node src/database/run-notification-migration.ts

echo "Migración completada." 