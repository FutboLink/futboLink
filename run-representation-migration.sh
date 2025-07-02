#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar el script de migración
echo "Ejecutando migración para crear la tabla de solicitudes de representación..."
npx ts-node src/database/run-representation-migration.ts

echo "Migración completada." 