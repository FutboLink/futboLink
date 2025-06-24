#!/bin/bash

# Este script aplica el SQL seguro para actualizar la tabla de aplicaciones
# directamente en la base de datos de producción

# URL de la base de datos de Render
DB_URL="postgresql://futbolink:h9mt6zRAUM2eF1rUuhr7wLgpvGSjknRX@dpg-cvi5vrl2ng1s73a1kda0-a.oregon-postgres.render.com/futbolinkdb"

echo "Aplicando script SQL seguro para actualizar la tabla de aplicaciones..."

# Ejecutar el script SQL
psql "$DB_URL" -f update-applications-table-safe.sql

echo "Script SQL aplicado correctamente." 