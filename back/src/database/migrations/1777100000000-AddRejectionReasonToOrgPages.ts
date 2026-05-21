import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRejectionReasonToOrgPages1777100000000 implements MigrationInterface {
    name = 'AddRejectionReasonToOrgPages1777100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            ADD COLUMN IF NOT EXISTS "rejectionReason" text;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            DROP COLUMN IF EXISTS "rejectionReason";
        `);
    }
}
