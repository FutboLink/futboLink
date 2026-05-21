import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrganizationPagesTable1776977352371 implements MigrationInterface {
    name = 'CreateOrganizationPagesTable1776977352371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."organization_pages_type_enum" AS ENUM(
                'CLUB',
                'ACADEMY',
                'TOURNAMENT_ORGANIZER',
                'FORMATION_SCHOOL',
                'AGENCY',
                'LEAGUE',
                'FEDERATION',
                'NATIONAL_TEAM'
            );
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."organization_pages_status_enum" AS ENUM('DRAFT', 'APPROVED', 'DEACTIVATED');
        `);

        await queryRunner.query(`
            CREATE TABLE "organization_pages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."organization_pages_type_enum" NOT NULL,
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "country" character varying,
                "region" character varying,
                "foundationYear" character varying,
                "description" text,
                "logoUrl" character varying,
                "bannerUrl" character varying,
                "website" character varying,
                "contactEmail" character varying,
                "phone" character varying,
                "socialMedia" jsonb NOT NULL DEFAULT '{}',
                "status" "public"."organization_pages_status_enum" NOT NULL DEFAULT 'DRAFT',
                "ownerId" uuid,
                "leagueId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_organization_pages_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_organization_pages_slug" UNIQUE ("slug")
            );
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_organization_pages_type" ON "organization_pages" ("type");
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_organization_pages_status" ON "organization_pages" ("status");
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_organization_pages_ownerId" ON "organization_pages" ("ownerId");
        `);

        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            ADD CONSTRAINT "FK_organization_pages_owner"
            FOREIGN KEY ("ownerId") REFERENCES "users"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        `);

        await queryRunner.query(`
            ALTER TABLE "organization_pages"
            ADD CONSTRAINT "FK_organization_pages_league"
            FOREIGN KEY ("leagueId") REFERENCES "organization_pages"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization_pages" DROP CONSTRAINT "FK_organization_pages_league";
        `);

        await queryRunner.query(`
            ALTER TABLE "organization_pages" DROP CONSTRAINT "FK_organization_pages_owner";
        `);

        await queryRunner.query(`
            DROP INDEX "public"."IDX_organization_pages_ownerId";
        `);

        await queryRunner.query(`
            DROP INDEX "public"."IDX_organization_pages_status";
        `);

        await queryRunner.query(`
            DROP INDEX "public"."IDX_organization_pages_type";
        `);

        await queryRunner.query(`
            DROP TABLE "organization_pages";
        `);

        await queryRunner.query(`
            DROP TYPE "public"."organization_pages_status_enum";
        `);

        await queryRunner.query(`
            DROP TYPE "public"."organization_pages_type_enum";
        `);
    }
}
