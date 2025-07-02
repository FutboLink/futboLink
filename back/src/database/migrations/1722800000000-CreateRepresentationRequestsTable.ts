import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRepresentationRequestsTable1722800000000 implements MigrationInterface {
    name = 'CreateRepresentationRequestsTable1722800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear el tipo enum para el estado de la solicitud
        await queryRunner.query(`
            CREATE TYPE "public"."representation_request_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');
        `);
        
        // Crear la tabla de solicitudes de representación
        await queryRunner.query(`
            CREATE TABLE "representation_requests" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "recruiterId" uuid NOT NULL,
                "playerId" uuid NOT NULL,
                "status" "public"."representation_request_status_enum" NOT NULL DEFAULT 'PENDING',
                "message" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_representation_requests" PRIMARY KEY ("id")
            )
        `);
        
        // Añadir restricciones de clave foránea
        await queryRunner.query(`
            ALTER TABLE "representation_requests" 
            ADD CONSTRAINT "FK_representation_requests_recruiter" 
            FOREIGN KEY ("recruiterId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);
        
        await queryRunner.query(`
            ALTER TABLE "representation_requests" 
            ADD CONSTRAINT "FK_representation_requests_player" 
            FOREIGN KEY ("playerId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar restricciones de clave foránea
        await queryRunner.query(`
            ALTER TABLE "representation_requests" 
            DROP CONSTRAINT "FK_representation_requests_player"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "representation_requests" 
            DROP CONSTRAINT "FK_representation_requests_recruiter"
        `);
        
        // Eliminar la tabla
        await queryRunner.query(`
            DROP TABLE "representation_requests"
        `);
        
        // Eliminar el tipo enum
        await queryRunner.query(`
            DROP TYPE "public"."representation_request_status_enum"
        `);
    }
} 