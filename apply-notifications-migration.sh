#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar la migración
echo "Ejecutando migración para crear la tabla de notificaciones..."
npm run migration:run

echo "Migración completada." 