import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecruiterApplicationFields1723000000000 implements MigrationInterface {
    name = 'AddRecruiterApplicationFields1723000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Añadir campo para indicar si la aplicación fue creada por un reclutador
        await queryRunner.query(`
            ALTER TABLE "application" ADD COLUMN "appliedByRecruiter" BOOLEAN NOT NULL DEFAULT false
        `);

        // Añadir campo para almacenar el ID del reclutador
        await queryRunner.query(`
            ALTER TABLE "application" ADD COLUMN "recruiterId" UUID
        `);

        // Añadir campo para el mensaje del reclutador
        await queryRunner.query(`
            ALTER TABLE "application" ADD COLUMN "recruiterMessage" TEXT
        `);

        // Añadir restricción de clave foránea para recruiterId
        await queryRunner.query(`
            ALTER TABLE "application" ADD CONSTRAINT "FK_application_recruiter" 
            FOREIGN KEY ("recruiterId") REFERENCES "users"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar restricción de clave foránea
        await queryRunner.query(`
            ALTER TABLE "application" DROP CONSTRAINT "FK_application_recruiter"
        `);

        // Eliminar columnas
        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "recruiterMessage"
        `);

        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "recruiterId"
        `);

        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "appliedByRecruiter"
        `);
    }
} 