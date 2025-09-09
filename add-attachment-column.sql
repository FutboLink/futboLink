-- Script SQL para agregar la columna attachmentUrl a la tabla verification_requests
-- Ejecutar este script directamente en la base de datos de Render si la migración automática falla

DO $$
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'verification_requests' 
        AND column_name = 'attachmentUrl'
    ) THEN
        -- Agregar la columna si no existe
        ALTER TABLE verification_requests 
        ADD COLUMN "attachmentUrl" text;
        
        RAISE NOTICE 'Columna attachmentUrl agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna attachmentUrl ya existe';
    END IF;
END $$;
