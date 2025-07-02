#!/bin/bash

# Navegar al directorio del backend
cd back

# Ejecutar el script de verificación
echo "Verificando valores del enum de notificaciones..."
npx ts-node src/check-enum-values.ts

echo "Verificación completada." 