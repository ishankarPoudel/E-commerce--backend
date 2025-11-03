import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGinIndexToSearchVector1760900000000 implements MigrationInterface {
  name = "AddGinIndexToSearchVector1760900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create GIN index for full-text search performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_bag_search_vector_gin 
      ON "bag_entity" USING GIN (search_vector);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_bag_search_vector_gin;
    `);
  }
}
