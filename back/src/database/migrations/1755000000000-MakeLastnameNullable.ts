import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeLastnameNullable1755000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "lastname" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "lastname" SET NOT NULL
        `);
    }

}

