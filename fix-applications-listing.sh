#!/bin/bash

# Navegar al directorio del backend
cd back

# Compilar el backend
echo "Compilando el backend..."
npm run build

# Reiniciar el servicio
echo "Reiniciando el servicio..."
pm2 restart futbolink-backend

echo "Corrección aplicada. Ahora deberías poder ver las aplicaciones correctamente." 