import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDivisionToOrganizationPages1777500000000 implements MigrationInterface {
    name = 'AddDivisionToOrganizationPages1777500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            ADD COLUMN IF NOT EXISTS "division" varchar;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages" DROP COLUMN IF EXISTS "division";
        `);
    }
}
