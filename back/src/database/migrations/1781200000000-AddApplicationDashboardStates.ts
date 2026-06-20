import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Módulo 3 (Dashboard de usuarios) — estados de postulación del panel.
 *
 * Agrega los estados de la escalera del panel al enum de application.status y
 * los tipos de notificación correspondientes.
 *
 * IMPORTANTE (convención del proyecto): las migraciones se corren A MANO en
 * producción. Los nombres de tipo se verificaron contra la BD real:
 *   - application.status  -> tipo "application_status_enum_new"
 *   - notifications.type  -> tipo "notifications_type_enum"
 *
 * `ALTER TYPE ... ADD VALUE IF NOT EXISTS` es idempotente (Postgres 12+).
 * No se puede quitar un valor de un enum en Postgres, por eso `down()` queda vacío.
 */
export class AddApplicationDashboardStates1781200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Estados de postulación (escalera del panel)
    await queryRunner.query(
      `ALTER TYPE "application_status_enum_new" ADD VALUE IF NOT EXISTS 'IN_REVIEW'`,
    );
    await queryRunner.query(
      `ALTER TYPE "application_status_enum_new" ADD VALUE IF NOT EXISTS 'PROFILE_VIEWED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "application_status_enum_new" ADD VALUE IF NOT EXISTS 'INTERESTED'`,
    );

    // Tipos de notificación del panel
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'APPLICATION_SENT'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'APPLICATION_IN_REVIEW'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'APPLICATION_PROFILE_VIEWED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'APPLICATION_INTEREST'`,
    );
    // Alinea prod con la entidad (este valor faltaba en la BD).
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'REPRESENTATION_REQUEST'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres no permite remover valores de un enum. No-op.
  }
}
