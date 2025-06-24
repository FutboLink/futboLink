-- Crear el nuevo tipo de enumeración si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status_enum_new') THEN
        CREATE TYPE "application_status_enum_new" AS ENUM('PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Type application_status_enum_new already exists, skipping...';
END $$;

-- Verificar si la tabla application existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'application') THEN
        -- Verificar si la columna status_new ya existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'application' AND column_name = 'status_new') THEN
            -- Crear una columna temporal con el nuevo tipo de enumeración
            ALTER TABLE "application" ADD "status_new" "application_status_enum_new" DEFAULT 'PENDING';
            
            -- Copiar los datos de la columna status a la columna status_new
            UPDATE "application" SET "status_new" = "status"::text::"application_status_enum_new";
            
            -- Eliminar la columna status
            ALTER TABLE "application" DROP COLUMN "status";
            
            -- Renombrar la columna status_new a status
            ALTER TABLE "application" RENAME COLUMN "status_new" TO "status";
        ELSE
            RAISE NOTICE 'Column status_new already exists, skipping status update...';
        END IF;
        
        -- Verificar si la columna shortlistedAt ya existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'application' AND column_name = 'shortlistedAt') THEN
            -- Agregar la columna shortlistedAt
            ALTER TABLE "application" ADD "shortlistedAt" TIMESTAMP;
        ELSE
            RAISE NOTICE 'Column shortlistedAt already exists, skipping...';
        END IF;
    ELSE
        RAISE NOTICE 'Table application does not exist, skipping all operations...';
    END IF;
END $$; 