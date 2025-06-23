-- Script seguro para actualizar la tabla de aplicaciones
-- Este script verifica la existencia de cada objeto antes de crear o modificar

-- Verificar si el tipo enum existe y crearlo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status_enum_new') THEN
        CREATE TYPE application_status_enum_new AS ENUM ('PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED');
        RAISE NOTICE 'Tipo enum application_status_enum_new creado';
    ELSE
        RAISE NOTICE 'Tipo enum application_status_enum_new ya existe';
    END IF;
END$$;

-- Verificar si la tabla application existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'application') THEN
        -- Verificar si la columna shortlistedAt ya existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'application' AND column_name = 'shortlistedAt') THEN
            -- Agregar la columna shortlistedAt
            ALTER TABLE application ADD COLUMN "shortlistedAt" TIMESTAMP;
            RAISE NOTICE 'Columna shortlistedAt agregada';
        ELSE
            RAISE NOTICE 'Columna shortlistedAt ya existe';
        END IF;
        
        -- Verificar el tipo de la columna status
        DECLARE
            column_type TEXT;
        BEGIN
            SELECT data_type INTO column_type 
            FROM information_schema.columns 
            WHERE table_name = 'application' AND column_name = 'status';
            
            -- Si es de tipo enum, verificamos si incluye SHORTLISTED
            IF column_type = 'USER-DEFINED' THEN
                -- Verificar si el enum actual incluye SHORTLISTED
                IF EXISTS (
                    SELECT 1 FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = 'application_status_enum' 
                    AND e.enumlabel = 'SHORTLISTED'
                ) THEN
                    RAISE NOTICE 'El enum status ya incluye SHORTLISTED';
                ELSE
                    -- Crear una columna temporal con el nuevo tipo
                    ALTER TABLE application ADD COLUMN status_new application_status_enum_new;
                    
                    -- Copiar los datos
                    UPDATE application SET status_new = 
                        CASE 
                            WHEN status = 'PENDING' THEN 'PENDING'::application_status_enum_new
                            WHEN status = 'ACCEPTED' THEN 'ACCEPTED'::application_status_enum_new
                            WHEN status = 'REJECTED' THEN 'REJECTED'::application_status_enum_new
                            ELSE 'PENDING'::application_status_enum_new
                        END;
                    
                    -- Eliminar la columna original
                    ALTER TABLE application DROP COLUMN status;
                    
                    -- Renombrar la nueva columna
                    ALTER TABLE application RENAME COLUMN status_new TO status;
                    
                    RAISE NOTICE 'Columna status actualizada para incluir SHORTLISTED';
                END IF;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error al verificar o actualizar la columna status: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'La tabla application no existe';
    END IF;
END$$; 