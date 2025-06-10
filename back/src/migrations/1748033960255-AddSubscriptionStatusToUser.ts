import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionStatusToUser1748033960255 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add subscriptionType column with default value 'Amateur'
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "subscriptionType" VARCHAR DEFAULT 'Amateur'
        `);
        
        // Add subscriptionExpiresAt column
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the columns if needed to rollback
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "subscriptionType"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "subscriptionExpiresAt"
        `);
    }

}
