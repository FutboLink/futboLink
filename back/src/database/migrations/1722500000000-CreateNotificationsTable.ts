import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1722500000000 implements MigrationInterface {
    name = 'CreateNotificationsTable1722500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."notifications_type_enum" AS ENUM('PROFILE_VIEW', 'APPLICATION_RECEIVED', 'JOB_UPDATED');
        `);
        
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "message" character varying NOT NULL,
                "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'PROFILE_VIEW',
                "read" boolean NOT NULL DEFAULT false,
                "userId" uuid NOT NULL,
                "sourceUserId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "metadata" json,
                CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "notifications" ADD CONSTRAINT "FK_56a79f28e233d9ca3bf26aec243" FOREIGN KEY ("sourceUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "notifications" DROP CONSTRAINT "FK_56a79f28e233d9ca3bf26aec243"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"
        `);
        
        await queryRunner.query(`
            DROP TABLE "notifications"
        `);
        
        await queryRunner.query(`
            DROP TYPE "public"."notifications_type_enum"
        `);
    }
} 