-- Script para actualizar el tipo de enumeración de notificaciones
-- Este script agrega el valor 'APPLICATION_SHORTLISTED' al tipo de enumeración notifications_type_enum

-- Verificar si el tipo enum existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type_enum') THEN
        -- Verificar si el valor ya existe en el enum
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_type_enum' 
            AND e.enumlabel = 'APPLICATION_SHORTLISTED'
        ) THEN
            -- Agregar el nuevo valor al enum
            ALTER TYPE notifications_type_enum ADD VALUE 'APPLICATION_SHORTLISTED';
            RAISE NOTICE 'Valor APPLICATION_SHORTLISTED agregado al tipo notifications_type_enum';
        ELSE
            RAISE NOTICE 'El valor APPLICATION_SHORTLISTED ya existe en el tipo notifications_type_enum';
        END IF;
    ELSE
        RAISE NOTICE 'El tipo notifications_type_enum no existe';
    END IF;
END $$; 