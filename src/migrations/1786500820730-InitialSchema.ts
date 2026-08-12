import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786500820730 implements MigrationInterface {
    name = 'InitialSchema1786500820730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "device_info_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "os" character varying, "browser" character varying, "device" character varying, "location" character varying, CONSTRAINT "PK_93358ad9b54cb0c02493f885bec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "categoryName" character varying NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "url" character varying NOT NULL, "publicId" character varying, "altText" character varying, "format" character varying, "width" integer, "height" integer, "bytes" integer, "sortOrder" integer NOT NULL DEFAULT '0', "bag_id" uuid, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_type_enum" AS ENUM('handbag', 'backpack', 'duffel', 'tote', 'crossbody', 'laptop_bag', 'luggage', 'suitcase', 'travel_set', 'school_bag')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."products_type_enum" NOT NULL DEFAULT 'handbag', "price" integer NOT NULL, "description" text, "brand" character varying, "material" character varying, "colors" text array, "sizes" text array, "weightKg" double precision, "capacityLiters" double precision, "isFeatured" boolean NOT NULL DEFAULT false, "features" jsonb, "search_vector" tsvector, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart-item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "quantity" integer NOT NULL, "color" character varying, "size" character varying, "cart_id" uuid, "product_id" uuid, CONSTRAINT "PK_0bab23e63a695e02f3b9496809b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "REL_756f53ab9466eb52a52619ee01" UNIQUE ("userId"), CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_entity_role_enum" AS ENUM('guest', 'user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "googleId" character varying, "email" character varying NOT NULL, "fullName" character varying, "phone" character varying, "role" "public"."user_entity_role_enum" NOT NULL DEFAULT 'user', "password" character varying, "isOauth" boolean NOT NULL DEFAULT false, "provider" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "emailVerificationTokenExpiresAt" TIMESTAMP, "refreshToken" character varying(255), "tokenVersion" integer NOT NULL DEFAULT '0', "isBanned" boolean NOT NULL DEFAULT false, "deviceInfoId" uuid, "cartId" uuid, CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5" UNIQUE ("email"), CONSTRAINT "REL_83e5a791f10fa88e10844f921c" UNIQUE ("deviceInfoId"), CONSTRAINT "REL_a8e1cc9a19b2e61f9b5cafbcd8" UNIQUE ("cartId"), CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "quantity" integer NOT NULL, "unitPrice" integer NOT NULL, "color" text, "size" text, "order_id" uuid, "product_id" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'pending', "orderStatus" character varying NOT NULL DEFAULT 'new', "deliveryMethod" character varying NOT NULL DEFAULT 'delivery', "currency" character varying NOT NULL DEFAULT 'NPR', "amount" integer NOT NULL, "paymentProvider" character varying, "esewaTransactionUuid" character varying, "esewaRefId" character varying, "esewaStatus" character varying, "stripePaymentIntentId" character varying, "stripeChargeId" character varying, "itemsSnapShot" jsonb, "shippingAddress" character varying, "user_id" uuid, CONSTRAINT "UQ_c3b4a5758c20194744609fe1cf0" UNIQUE ("esewaTransactionUuid"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_category_relation" ("productsId" uuid NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_e5858cc1c92f6d6a66cbd9c0ee9" PRIMARY KEY ("productsId", "categoryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0cf6143be8a2caa3b903209ec4" ON "product_category_relation" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1fa40ebd02cea8e8544a3a876b" ON "product_category_relation" ("categoryId") `);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_a15521f5de4fd1c415d133e6563" FOREIGN KEY ("bag_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart-item" ADD CONSTRAINT "FK_a1c482ed7f51a23b6b32a125fbe" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart-item" ADD CONSTRAINT "FK_2a4880e1298fbd563e900f601b3" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_756f53ab9466eb52a52619ee019" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_entity" ADD CONSTRAINT "FK_83e5a791f10fa88e10844f921c0" FOREIGN KEY ("deviceInfoId") REFERENCES "device_info_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_entity" ADD CONSTRAINT "FK_a8e1cc9a19b2e61f9b5cafbcd86" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_category_relation" ADD CONSTRAINT "FK_0cf6143be8a2caa3b903209ec40" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_category_relation" ADD CONSTRAINT "FK_1fa40ebd02cea8e8544a3a876ba" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_category_relation" DROP CONSTRAINT "FK_1fa40ebd02cea8e8544a3a876ba"`);
        await queryRunner.query(`ALTER TABLE "product_category_relation" DROP CONSTRAINT "FK_0cf6143be8a2caa3b903209ec40"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "user_entity" DROP CONSTRAINT "FK_a8e1cc9a19b2e61f9b5cafbcd86"`);
        await queryRunner.query(`ALTER TABLE "user_entity" DROP CONSTRAINT "FK_83e5a791f10fa88e10844f921c0"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_756f53ab9466eb52a52619ee019"`);
        await queryRunner.query(`ALTER TABLE "cart-item" DROP CONSTRAINT "FK_2a4880e1298fbd563e900f601b3"`);
        await queryRunner.query(`ALTER TABLE "cart-item" DROP CONSTRAINT "FK_a1c482ed7f51a23b6b32a125fbe"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_a15521f5de4fd1c415d133e6563"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1fa40ebd02cea8e8544a3a876b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0cf6143be8a2caa3b903209ec4"`);
        await queryRunner.query(`DROP TABLE "product_category_relation"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "user_entity"`);
        await queryRunner.query(`DROP TYPE "public"."user_entity_role_enum"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP TABLE "cart-item"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_type_enum"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "device_info_entity"`);
    }

}
