import "reflect-metadata";
import "dotenv/config";
import AppDataSource from "../data-source/data-source";
import { seedBags } from "../../seeders/product.seeder";

async function main() {
  console.time("seed");
  await AppDataSource.initialize();
  try {
    await seedBags();
    console.log("Seeding finished ✅");
  } catch (err) {
    console.error("Seeding failed ❌", err);
    process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
    console.timeEnd("seed");
  }
}

main();
