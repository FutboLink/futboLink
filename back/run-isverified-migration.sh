#!/bin/bash

echo "🚀 Ejecutando migración para agregar columna isVerified..."

# Ejecutar la migración específica
cd /opt/render/project/src/back
npx ts-node src/database/run-isverified-migration.ts

echo "✅ Migración de isVerified completada!" 