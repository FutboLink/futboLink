import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateLegacyPuestosToRepresentante1776991896000
  implements MigrationInterface
{
  name = 'MigrateLegacyPuestosToRepresentante1776991896000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users"
      SET "puesto" = 'Representante'
      WHERE "puesto" IN ('Intermediario', 'Agencia de representación')
    `);
  }

  public async down(): Promise<void> {
    throw new Error(
      'MigrateLegacyPuestosToRepresentante is not reversible: the original puesto value is lost on consolidation. Restore from a database backup if a rollback is needed.',
    );
  }
}
