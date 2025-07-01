import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecruiterPortfolio1722700000000 implements MigrationInterface {
    name = 'AddRecruiterPortfolio1722700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "recruiter_portfolio" (
                "recruiterId" uuid NOT NULL,
                "playerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_recruiter_portfolio" PRIMARY KEY ("recruiterId", "playerId")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "recruiter_portfolio" 
            ADD CONSTRAINT "FK_recruiter_portfolio_recruiter" 
            FOREIGN KEY ("recruiterId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);
        
        await queryRunner.query(`
            ALTER TABLE "recruiter_portfolio" 
            ADD CONSTRAINT "FK_recruiter_portfolio_player" 
            FOREIGN KEY ("playerId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "recruiter_portfolio" 
            DROP CONSTRAINT "FK_recruiter_portfolio_player"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "recruiter_portfolio" 
            DROP CONSTRAINT "FK_recruiter_portfolio_recruiter"
        `);
        
        await queryRunner.query(`
            DROP TABLE "recruiter_portfolio"
        `);
    }
} 