import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompetitionLevelToUsers1724000000000 implements MigrationInterface {
    name = 'AddCompetitionLevelToUsers1724000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "competitionLevel" character varying NOT NULL DEFAULT 'amateur'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "competitionLevel"`);
    }
}
