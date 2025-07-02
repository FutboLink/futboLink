#!/bin/bash

echo "Aplicando migración para crear la tabla de cartera de reclutadores..."

# Ejecutar el SQL directamente en la base de datos de producción
# Nota: Necesitas tener psql instalado y configurado para conectar a la base de datos
psql postgres://futbolink_user:HWrPKWxLhLMTnXzgTdKtaXCFBdtZDTDR@dpg-cnkdm1da73kc73dkd6k0-a.oregon-postgres.render.com/futbolink -f create-portfolio-table.sql

echo "Migración completada. La tabla recruiter_portfolio ha sido creada."
echo "Los reclutadores ahora pueden añadir jugadores a su cartera." 