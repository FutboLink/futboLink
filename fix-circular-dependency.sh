#!/bin/bash

# Navegar al directorio del backend
cd back

echo "Compilando el backend..."
npm run build

echo "Reiniciando el servicio..."
pm2 restart futbolink-backend

echo "Corrección de dependencia circular completada." 