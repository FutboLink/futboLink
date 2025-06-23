#!/bin/bash

# Este script aplica todos los cambios necesarios para la funcionalidad de selección de candidatos
# directamente en la base de datos de producción

# URL de la base de datos de Render
DB_URL="postgresql://futbolink:h9mt6zRAUM2eF1rUuhr7wLgpvGSjknRX@dpg-cvi5vrl2ng1s73a1kda0-a.oregon-postgres.render.com/futbolinkdb"

echo "Aplicando actualizaciones para la funcionalidad de selección de candidatos..."

# Ejecutar el script SQL para actualizar la tabla de aplicaciones
echo "1. Actualizando la tabla de aplicaciones..."
psql "$DB_URL" -f update-applications-table-safe.sql

# Ejecutar el script SQL para actualizar el tipo de enumeración de notificaciones
echo "2. Actualizando el tipo de enumeración de notificaciones..."
psql "$DB_URL" -f update-notifications-enum.sql

echo "Actualizaciones aplicadas correctamente." 