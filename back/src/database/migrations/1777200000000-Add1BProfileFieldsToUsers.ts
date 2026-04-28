import { MigrationInterface, QueryRunner } from "typeorm";

export class Add1BProfileFieldsToUsers1777200000000 implements MigrationInterface {
    name = 'Add1BProfileFieldsToUsers1777200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "secondNationality" varchar,
            ADD COLUMN IF NOT EXISTS "secondNationalityEuPassport" boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS "videoUrls" text[] DEFAULT ARRAY[]::text[],
            ADD COLUMN IF NOT EXISTS "photoUrls" text[] DEFAULT ARRAY[]::text[];
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN IF EXISTS "photoUrls",
            DROP COLUMN IF EXISTS "videoUrls",
            DROP COLUMN IF EXISTS "secondNationalityEuPassport",
            DROP COLUMN IF EXISTS "secondNationality";
        `);
    }
}
