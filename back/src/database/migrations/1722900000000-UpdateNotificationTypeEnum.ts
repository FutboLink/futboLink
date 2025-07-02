import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotificationTypeEnum1722900000000 implements MigrationInterface {
    name = 'UpdateNotificationTypeEnum1722900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Actualizar el tipo enum para incluir el nuevo valor
        await queryRunner.query(`
            ALTER TYPE "public"."notifications_type_enum" ADD VALUE 'REPRESENTATION_REQUEST' AFTER 'APPLICATION_SHORTLISTED';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No se puede eliminar un valor de un tipo enum en PostgreSQL directamente
        // Se necesitaría recrear el tipo enum sin el valor, lo cual es complejo
        // Por lo tanto, dejamos esta operación vacía
    }
} 