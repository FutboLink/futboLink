import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttachmentUrlToVerificationRequests1735000000000 implements MigrationInterface {
    name = 'AddAttachmentUrlToVerificationRequests1735000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add attachmentUrl column to verification_requests table
        await queryRunner.query(`
            ALTER TABLE "verification_requests" 
            ADD COLUMN "attachmentUrl" text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove attachmentUrl column from verification_requests table
        await queryRunner.query(`
            ALTER TABLE "verification_requests" 
            DROP COLUMN "attachmentUrl"
        `);
    }
}
