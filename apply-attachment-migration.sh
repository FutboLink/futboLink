#!/bin/bash

echo "🚀 Ejecutando migración para agregar attachmentUrl a verification_requests..."

cd back
node -r ts-node/register src/database/run-attachment-migration.ts

echo "✅ Migración completada"
