import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentColumns1716022701812 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new PAYMENT_REQUIRED status to the payment_status enum
    await queryRunner.query(`
      ALTER TYPE "public"."payments_status_enum" ADD VALUE IF NOT EXISTS 'payment_required';
    `);

    // Add missing columns to the payments table
    await queryRunner.query(`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS "subscription_status" character varying,
      ADD COLUMN IF NOT EXISTS "failure_reason" character varying,
      ADD COLUMN IF NOT EXISTS "last_invoice_id" character varying,
      ADD COLUMN IF NOT EXISTS "last_payment_date" TIMESTAMP;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the added columns
    await queryRunner.query(`
      ALTER TABLE payments
      DROP COLUMN IF EXISTS "subscription_status",
      DROP COLUMN IF EXISTS "failure_reason",
      DROP COLUMN IF EXISTS "last_invoice_id",
      DROP COLUMN IF EXISTS "last_payment_date";
    `);

    // Note: We cannot remove a value from an enum in PostgreSQL easily
    // For a proper rollback, you would need to create a new enum and 
    // update the column to use it, which is complex for a migration rollback
  }
} 