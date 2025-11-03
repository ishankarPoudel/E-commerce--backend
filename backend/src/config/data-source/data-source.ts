import { join } from "path";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "classmate",
  database: process.env.DB_NAME || "ecommerce",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.DB_LOGGING === "true",
  entities: ["src/entities/**/*.ts"],
  migrations: ["../../migrations/**/*.{ts,js}"],
  subscribers: [],
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || "10"),
    min: parseInt(process.env.DB_POOL_MIN || "2"),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "2000"),
  },
  cache: {
    type: "database",
    duration: 30000,
  },
});
export default AppDataSource;
