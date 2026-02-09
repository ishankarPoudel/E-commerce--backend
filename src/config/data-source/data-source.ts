import { join } from "path";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: ["src/entities/**/*.ts"],
  migrations: ["../../migrations/**/*.{ts,js}"],
  schema: "public",
  migrationsRun: false,
  subscribers: [],
});
export default AppDataSource;
