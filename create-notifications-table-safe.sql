-- Crear tipo de enumeración para los tipos de notificaciones si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type_enum') THEN
        CREATE TYPE "public"."notifications_type_enum" AS ENUM('PROFILE_VIEW', 'APPLICATION_RECEIVED', 'JOB_UPDATED');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Type notifications_type_enum already exists, skipping...';
END $$;

-- Crear tabla de notificaciones si no existe
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "message" character varying NOT NULL,
    "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'PROFILE_VIEW',
    "read" boolean NOT NULL DEFAULT false,
    "userId" uuid NOT NULL,
    "sourceUserId" uuid,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "metadata" json,
    CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
);

-- Verificar si la extensión uuid-ossp está instalada y activarla si es necesario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Extension uuid-ossp already exists, skipping...';
END $$;

-- Agregar restricciones de clave foránea si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_9a8a82462cab47c73d25f49261f'
    ) THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Foreign key FK_9a8a82462cab47c73d25f49261f already exists, skipping...';
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_56a79f28e233d9ca3bf26aec243'
    ) THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "FK_56a79f28e233d9ca3bf26aec243" 
        FOREIGN KEY ("sourceUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Foreign key FK_56a79f28e233d9ca3bf26aec243 already exists, skipping...';
END $$; 