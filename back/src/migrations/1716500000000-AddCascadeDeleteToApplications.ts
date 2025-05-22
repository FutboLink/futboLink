import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToApplications1716500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the existing foreign key constraint
    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'application'::regclass::oid
        AND contype = 'f'
        AND confrelid = 'users'::regclass::oid;
        
        IF constraint_name IS NOT NULL THEN
          EXECUTE 'ALTER TABLE application DROP CONSTRAINT ' || constraint_name;
        END IF;
      END $$;
    `);

    // Re-add the foreign key with ON DELETE CASCADE
    await queryRunner.query(`
      ALTER TABLE application
      ADD CONSTRAINT fk_application_player
      FOREIGN KEY ("playerId")
      REFERENCES users(id)
      ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First, drop the cascade constraint
    await queryRunner.query(`
      ALTER TABLE application DROP CONSTRAINT IF EXISTS fk_application_player;
    `);

    // Re-add the regular foreign key without cascade
    await queryRunner.query(`
      ALTER TABLE application
      ADD CONSTRAINT fk_application_player
      FOREIGN KEY ("playerId")
      REFERENCES users(id);
    `);
  }
} 