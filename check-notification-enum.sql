-- Script para verificar el nombre del tipo de enumeración de notificaciones
SELECT t.typname AS enum_name
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE e.enumlabel IN ('PROFILE_VIEW', 'APPLICATION_RECEIVED', 'JOB_UPDATED')
AND n.nspname = 'public'
GROUP BY t.typname
HAVING COUNT(DISTINCT e.enumlabel) >= 2; 