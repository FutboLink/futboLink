import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrigramAndPendingStatusToOrgPages1777000000000 implements MigrationInterface {
    name = 'AddTrigramAndPendingStatusToOrgPages1777000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

        await queryRunner.query(`
            ALTER TYPE "public"."organization_pages_status_enum"
            ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';
        `);

        await queryRunner.query(`
            ALTER TYPE "public"."organization_pages_status_enum"
            ADD VALUE IF NOT EXISTS 'REJECTED';
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_organization_pages_name_trgm"
            ON "organization_pages"
            USING gin (name gin_trgm_ops);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_organization_pages_name_trgm";`);

        // Postgres no permite quitar valores de un enum directamente. Si fuese necesario revertir,
        // habría que recrear el enum. Para no romper datos existentes, dejamos los valores nuevos.
    }
}
