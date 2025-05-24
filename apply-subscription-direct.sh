#!/bin/bash

echo "Aplicando cambios al sistema de suscripciones directo..."

# Cambiar al directorio del frontend
cd front

# Compilar el frontend
echo "Compilando el frontend..."
npm run build

echo "Cambios aplicados correctamente!"
echo ""
echo "IMPORTANTE: Se ha modificado el sistema de suscripciones para hacerlo completamente independiente:"
echo ""
echo "1. SIMPLIFICACIÓN DEL PROCESO DE SUSCRIPCIÓN:"
echo "   - Ya no se requiere interacción con Stripe para activar suscripciones"
echo "   - La página de éxito ahora acepta un único parámetro 'plan' (ej: /payment/success?plan=Semiprofesional)"
echo "   - Esto evita problemas con parámetros ausentes o inválidos"
echo ""
echo "2. FUNCIONAMIENTO DEL SISTEMA:"
echo "   - Al hacer clic en 'Contratar' en la página de suscripciones, se redirige directamente a la página de éxito"
echo "   - La página de éxito actualiza el tipo de suscripción en la base de datos"
echo "   - El perfil del usuario mostrará el nuevo estado de suscripción inmediatamente"
echo ""
echo "3. PRUEBA DEL SISTEMA:"
echo "   - Para probar, simplemente visita: http://localhost:3000/payment/success?plan=Semiprofesional"
echo "   - O haz clic en 'Contratar' en la página de suscripciones"
echo ""
echo "Para reiniciar los servidores, use:"
echo "- Backend: cd back && npm run start:dev"
echo "- Frontend: cd front && npm run dev" 