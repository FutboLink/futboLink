-- Add subscriptionType column with default value 'Amateur'
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "subscriptionType" VARCHAR DEFAULT 'Amateur';

-- Add subscriptionExpiresAt column
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP; 