#!/bin/bash

echo "Aplicando cambios al sistema de suscripciones..."

# Cambiar al directorio del backend
cd back

# Compilar el backend
echo "Compilando el backend..."
npm run build

# Cambiar al directorio del frontend
cd ../front

# Compilar el frontend
echo "Compilando el frontend..."
npm run build

echo "Cambios aplicados correctamente!"
echo ""
echo "IMPORTANTE: Para que los cambios surtan efecto completamente, es necesario:"
echo "1. Asegurarse de que la base de datos tiene los campos 'subscriptionType' y 'subscriptionExpiresAt' en la tabla 'users'"
echo "2. Reiniciar tanto el servidor backend como el frontend"
echo ""
echo "El sistema de suscripciones ahora funciona de manera independiente de Stripe:"
echo "- Los usuarios comienzan con tipo 'Amateur' por defecto"
echo "- Cuando completan un pago, su tipo se actualiza directamente en la base de datos"
echo "- No se realizan consultas a Stripe para verificar el estado de suscripción"
echo ""
echo "Para reiniciar los servidores, use:"
echo "- Backend: cd back && npm run start:dev"
echo "- Frontend: cd front && npm run dev" 