#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar el script de migración
echo "Ejecutando migración para crear la tabla de cartera de reclutadores..."
npx ts-node src/database/run-portfolio-migration.ts

echo "Migración completada." 