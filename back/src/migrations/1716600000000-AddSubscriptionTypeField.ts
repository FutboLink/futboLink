import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionTypeField1716600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First create the enum type if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan_enum') THEN
          CREATE TYPE subscription_plan_enum AS ENUM ('Amateur', 'Semiprofesional', 'Profesional');
        END IF;
      END$$;
    `);

    // Add the subscriptionType column to the payments table
    await queryRunner.query(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS "subscription_type" subscription_plan_enum;
    `);

    // Update existing records based on price ID
    await queryRunner.query(`
      UPDATE payments 
      SET subscription_type = 'Semiprofesional'
      WHERE stripe_price_id = 'price_1R7MPlGbCHvHfqXFNjW8oj2k' 
        AND subscription_type IS NULL;
    `);

    await queryRunner.query(`
      UPDATE payments 
      SET subscription_type = 'Profesional'
      WHERE stripe_price_id = 'price_1R7MaqGbCHvHfqXFimcCzvlo' 
        AND subscription_type IS NULL;
    `);

    await queryRunner.query(`
      UPDATE payments 
      SET subscription_type = 'Amateur'
      WHERE type = 'subscription' 
        AND subscription_type IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the subscriptionType column
    await queryRunner.query(`
      ALTER TABLE payments 
      DROP COLUMN IF EXISTS "subscription_type";
    `);

    // We don't drop the enum type as it might be used by other columns
  }
} 