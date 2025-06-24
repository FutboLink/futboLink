-- Script para actualizar el tipo de enumeración de notificaciones
-- Este script agrega el valor 'APPLICATION_SHORTLISTED' al tipo de enumeración notification_type_enum

-- Verificar si el tipo enum existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        -- Verificar si el valor ya existe en el enum
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notification_type_enum' 
            AND e.enumlabel = 'APPLICATION_SHORTLISTED'
        ) THEN
            -- Agregar el nuevo valor al enum
            ALTER TYPE notification_type_enum ADD VALUE 'APPLICATION_SHORTLISTED';
            RAISE NOTICE 'Valor APPLICATION_SHORTLISTED agregado al tipo notification_type_enum';
        ELSE
            RAISE NOTICE 'El valor APPLICATION_SHORTLISTED ya existe en el tipo notification_type_enum';
        END IF;
    ELSE
        RAISE NOTICE 'El tipo notification_type_enum no existe';
    END IF;
END $$; 