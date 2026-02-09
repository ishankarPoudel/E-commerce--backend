import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOSTNAME || "localhost",
  port: 5432,
  username: process.env.DATABASE_USERNAME || "postgres",
  password: process.env.DATABASE_PASSWORD || "classmate",
  database: process.env.DATABASE_NAME || "ecommerce",
  synchronize: true,
  logging: false,
  entities: ["src/entities/**/*.ts"],
  migrations: ["../../migrations/**/*.{ts,js}"],
  schema: "public",
  migrationsRun: false,
  subscribers: [],
});
export default AppDataSource;
