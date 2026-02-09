import { DataSource } from "typeorm";
import path from "path";

const AppDataSource = new DataSource({
  type: "postgres",

  //  Use DATABASE_URL if available (Render), otherwise use individual vars (local)
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOSTNAME || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        username: process.env.DATABASE_USERNAME || "postgres",
        password: process.env.DATABASE_PASSWORD || "classmate",
        database: process.env.DATABASE_NAME || "ecommerce",
      }),
  synchronize: process.env.NODE_ENV !== "production", //
  logging: process.env.NODE_ENV === "development",

  //  Fix entity paths for compiled JavaScript
  entities: [path.join(__dirname, "../../entities/**/*.entity.{ts,js}")],
  migrations: [path.join(__dirname, "../../migrations/**/*.{ts,js}")],

  schema: "public",
  migrationsRun: false,
  subscribers: [],

  // SSL REQUIRED for Render PostgreSQL
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export default AppDataSource;
