import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaToOrganizationPages1777300000000 implements MigrationInterface {
    name = 'AddMediaToOrganizationPages1777300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            ADD COLUMN IF NOT EXISTS "photoUrls" text[] DEFAULT ARRAY[]::text[];
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            DROP COLUMN IF EXISTS "photoUrls";
        `);
    }
}
