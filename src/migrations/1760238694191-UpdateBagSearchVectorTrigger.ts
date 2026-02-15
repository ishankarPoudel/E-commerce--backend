import { MigrationInterface, QueryRunner } from "typeorm";

export class FixBagSearchVector1760756000000 implements MigrationInterface {
  name = "FixBagSearchVector1760756000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_bag_search_vector() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          to_tsvector(
            'english',
            coalesce(NEW.name, '') || ' ' ||
            coalesce(NEW.description, '') || ' ' ||
            coalesce((
              SELECT string_agg(c."categoryName", ' ')
              FROM "bag_categorey_relation" bcr
              JOIN "category" c ON c."id" = bcr."categoryId"
              WHERE bcr."bagEntityId" = NEW."id"
                AND c."deletedAt" IS NULL
            ), '')
          );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS bag_search_vector_trigger ON "bag_entity";
      CREATE TRIGGER bag_search_vector_trigger
      BEFORE INSERT OR UPDATE ON "bag_entity"
      FOR EACH ROW
      EXECUTE FUNCTION update_bag_search_vector();
    `);

    await queryRunner.query(`UPDATE "bag_entity" SET "name" = "name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS bag_search_vector_trigger ON "bag_entity"`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_bag_search_vector`);
  }
}
