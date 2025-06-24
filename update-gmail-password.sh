#!/bin/bash

# Script para actualizar la contraseña de aplicación de Gmail en el archivo .env
# Autor: Federico Suarez
# Fecha: 24/06/2025

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si se proporciona la nueva contraseña como argumento
if [ $# -ne 1 ]; then
    echo -e "${RED}Error: Se requiere exactamente un argumento (la nueva contraseña de aplicación).${NC}"
    echo -e "Uso: $0 <nueva_contraseña_de_aplicación>"
    echo -e "\nPara generar una contraseña de aplicación para Gmail:"
    echo -e "1. Ve a tu cuenta de Google: https://myaccount.google.com/"
    echo -e "2. Selecciona 'Seguridad'"
    echo -e "3. En 'Acceso a Google', selecciona 'Contraseñas de aplicaciones'"
    echo -e "4. Genera una nueva contraseña para la aplicación 'FutboLink'"
    exit 1
fi

NEW_PASSWORD=$1
ENV_FILE="back/.env"

# Verificar si el archivo .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: El archivo $ENV_FILE no existe.${NC}"
    exit 1
fi

# Hacer una copia de seguridad del archivo .env
cp "$ENV_FILE" "${ENV_FILE}.bak"
echo -e "${GREEN}Se ha creado una copia de seguridad en ${ENV_FILE}.bak${NC}"

# Actualizar la contraseña en el archivo .env
if sed -i.tmp "s/MAIL_PASSWORD=.*/MAIL_PASSWORD=$NEW_PASSWORD/" "$ENV_FILE"; then
    rm "${ENV_FILE}.tmp" # Eliminar archivo temporal en macOS
    echo -e "${GREEN}¡La contraseña de Gmail se ha actualizado correctamente!${NC}"
    echo -e "${YELLOW}Importante:${NC} Asegúrate de que esta contraseña sea una 'contraseña de aplicación' generada en tu cuenta de Google."
    echo -e "Si sigues teniendo problemas para enviar correos, verifica:"
    echo -e "1. Que la cuenta futbolink.contacto@gmail.com tenga la verificación en dos pasos activada"
    echo -e "2. Que hayas generado correctamente una contraseña de aplicación"
    echo -e "3. Que no haya restricciones adicionales en la cuenta de Google"
else
    echo -e "${RED}Error: No se pudo actualizar la contraseña.${NC}"
    # Restaurar la copia de seguridad
    mv "${ENV_FILE}.bak" "$ENV_FILE"
    exit 1
fi

# Sugerir reiniciar el servidor
echo -e "\n${YELLOW}Recuerda reiniciar el servidor para que los cambios surtan efecto.${NC}"
echo -e "Puedes hacerlo con: npm run start:dev (desarrollo) o reiniciando el servicio en producción."

exit 0 