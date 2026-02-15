import { DataSource } from "typeorm";
import path from "path";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

const AppDataSource = new DataSource({
  type: "postgres",

  // Only use DATABASE_URL in production
  ...(isProduction && process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOSTNAME || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        username: process.env.DATABASE_USERNAME || "postgres",
        password: process.env.DATABASE_PASSWORD || "classmate",
        database: process.env.DATABASE_NAME || "ecommerce",
      }),

  synchronize: isDevelopment, // Only in development
  logging: isDevelopment,

  entities: [path.join(__dirname, "../../entities/**/*.entity.{ts,js}")],
  migrations: [path.join(__dirname, "../../migrations/**/*.{ts,js}")],

  schema: "public",
  migrationsRun: false,
  subscribers: [],

  //  SSL only in production
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
