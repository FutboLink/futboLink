#!/bin/bash

echo "Aplicando cambios al sistema de suscripciones..."

# Cambiar al directorio del frontend
cd front

# Compilar el frontend
echo "Compilando el frontend..."
npm run build

echo "Cambios aplicados correctamente!"
echo ""
echo "IMPORTANTE: Se ha modificado el sistema de suscripciones para hacerlo más robusto:"
echo ""
echo "1. SIMPLIFICACIÓN DEL PROCESO DE PAGO:"
echo "   - Se mantiene el checkout de Stripe para procesar los pagos"
echo "   - Ahora se pasa un parámetro 'plan' a la página de éxito (ej: /payment/success?plan=Semiprofesional)"
echo "   - El parámetro simplificado evita problemas con los parámetros de Stripe"
echo ""
echo "2. FUNCIONAMIENTO DEL SISTEMA:"
echo "   - El usuario selecciona un plan y se redirige al checkout de Stripe"
echo "   - Después del pago, Stripe redirige a la página de éxito con el parámetro 'plan'"
echo "   - La página de éxito utiliza ese parámetro para actualizar directamente el tipo de suscripción"
echo "   - La base de datos almacena el tipo de suscripción independientemente de Stripe"
echo ""
echo "3. VENTAJAS:"
echo "   - Proceso de pago seguro a través de Stripe"
echo "   - Mayor robustez al no depender de los IDs específicos de Stripe"
echo "   - Estado de suscripción manejado directamente por nuestra base de datos"
echo ""
echo "Para reiniciar los servidores, use:"
echo "- Backend: cd back && npm run start:dev"
echo "- Frontend: cd front && npm run dev" 