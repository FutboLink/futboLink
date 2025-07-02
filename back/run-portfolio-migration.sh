#!/bin/bash

echo "Ejecutando migración para crear la tabla de cartera de reclutadores..."

# Ejecutar la migración
npm run migration:run

echo "Migración completada. La tabla recruiter_portfolio ha sido creada."
echo "Los reclutadores ahora pueden añadir jugadores a su cartera." 