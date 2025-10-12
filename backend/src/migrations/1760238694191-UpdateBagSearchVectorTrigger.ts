import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBagSearchVectorTrigger1760238694191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_bag_search_vector() RETURNS trigger AS $$
            BEGIN
               NEW.search_vector :=
  to_tsvector(
    'english',
    coalesce(NEW.name,'') || ' ' ||
    coalesce(
      (SELECT string_agg(c.name, ' ')
       FROM category c
       JOIN bag_categorey_relation bcr ON c.id = bcr."categoryId"
       WHERE bcr."bagEntityId" = NEW.id), '')
  );

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
            CREATE TRIGGER bag_search_vector_trigger
            BEFORE INSERT OR UPDATE ON bag_entity
            FOR EACH ROW
            EXECUTE FUNCTION update_bag_search_vector();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS bag_search_vector_trigger ON bag_entity;
        `);

    await queryRunner.query(`
            DROP FUNCTION IF EXISTS update_bag_search_vector;
        `);
  }
}
