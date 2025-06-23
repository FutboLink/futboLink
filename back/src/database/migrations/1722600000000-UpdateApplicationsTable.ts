import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateApplicationsTable1722600000000 implements MigrationInterface {
    name = 'UpdateApplicationsTable1722600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear el nuevo tipo de enumeración con el estado SHORTLISTED
        await queryRunner.query(`
            CREATE TYPE "application_status_enum_new" AS ENUM('PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED')
        `);

        // Crear una columna temporal con el nuevo tipo de enumeración
        await queryRunner.query(`
            ALTER TABLE "application" ADD "status_new" "application_status_enum_new" DEFAULT 'PENDING'
        `);

        // Copiar los datos de la columna status a la columna status_new
        await queryRunner.query(`
            UPDATE "application" SET "status_new" = "status"::text::"application_status_enum_new"
        `);

        // Eliminar la columna status
        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "status"
        `);

        // Renombrar la columna status_new a status
        await queryRunner.query(`
            ALTER TABLE "application" RENAME COLUMN "status_new" TO "status"
        `);

        // Agregar la columna shortlistedAt
        await queryRunner.query(`
            ALTER TABLE "application" ADD "shortlistedAt" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la columna shortlistedAt
        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "shortlistedAt"
        `);

        // Crear el tipo de enumeración original
        await queryRunner.query(`
            CREATE TYPE "application_status_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')
        `);

        // Crear una columna temporal con el tipo de enumeración original
        await queryRunner.query(`
            ALTER TABLE "application" ADD "status_old" "application_status_enum_old" DEFAULT 'PENDING'
        `);

        // Copiar los datos de la columna status a la columna status_old
        // Los registros con status = 'SHORTLISTED' se convertirán a 'PENDING'
        await queryRunner.query(`
            UPDATE "application" SET "status_old" = 
            CASE 
                WHEN "status" = 'SHORTLISTED' THEN 'PENDING'
                ELSE "status"::text::"application_status_enum_old"
            END
        `);

        // Eliminar la columna status
        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "status"
        `);

        // Renombrar la columna status_old a status
        await queryRunner.query(`
            ALTER TABLE "application" RENAME COLUMN "status_old" TO "status"
        `);
    }
} 