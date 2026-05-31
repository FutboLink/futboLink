import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFederationToOrganizationPages1777400000000 implements MigrationInterface {
    name = 'AddFederationToOrganizationPages1777400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            ADD COLUMN IF NOT EXISTS "federationId" uuid;
        `);

        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            ADD CONSTRAINT "FK_organization_pages_federation"
            FOREIGN KEY ("federationId") REFERENCES "organization_pages"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages" DROP CONSTRAINT IF EXISTS "FK_organization_pages_federation";
        `);

        await queryRunner.query(`
            ALTER TABLE "organization_pages" DROP COLUMN IF EXISTS "federationId";
        `);
    }
}
