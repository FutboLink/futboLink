import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionFields1722441296352 implements MigrationInterface {
    name = 'AddSubscriptionFields1722441296352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Añadir columna subscriptionType con valor por defecto 'Amateur'
        await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionType" character varying NOT NULL DEFAULT 'Amateur'`);
        
        // Añadir columna subscriptionExpiresAt como nullable
        await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionExpiresAt" TIMESTAMP`);
        
        // Añadir columnas de timestamps si no existen
        const hasCreatedAt = await queryRunner.hasColumn("users", "createdAt");
        const hasUpdatedAt = await queryRunner.hasColumn("users", "updatedAt");
        
        if (!hasCreatedAt) {
            await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        }
        
        if (!hasUpdatedAt) {
            await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columnas en caso de rollback
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionType"`);
    }
} 