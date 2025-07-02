-- Crear la tabla de cartera de reclutadores
CREATE TABLE IF NOT EXISTS "recruiter_portfolio" (
    "recruiterId" uuid NOT NULL,
    "playerId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_recruiter_portfolio" PRIMARY KEY ("recruiterId", "playerId")
);

-- Añadir restricciones de clave foránea
ALTER TABLE "recruiter_portfolio" 
ADD CONSTRAINT "FK_recruiter_portfolio_recruiter" 
FOREIGN KEY ("recruiterId") 
REFERENCES "users"("id") 
ON DELETE CASCADE;

ALTER TABLE "recruiter_portfolio" 
ADD CONSTRAINT "FK_recruiter_portfolio_player" 
FOREIGN KEY ("playerId") 
REFERENCES "users"("id") 
ON DELETE CASCADE; 