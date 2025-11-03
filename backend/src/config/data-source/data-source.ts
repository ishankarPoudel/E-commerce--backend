import { join } from "path";
import { DataSource } from "typeorm";

function getPositiveInteger(key: string, defaultValue: number): number {
  const value = parseInt(process.env[key] || String(defaultValue));
  if (isNaN(value) || value <= 0) {
    throw new Error(
      `Invalid database configuration: ${key} must be a positive integer. Got: ${process.env[key]}`
    );
  }
  return value;
}

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: getPositiveInteger("DB_PORT", 5432),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "classmate",
  database: process.env.DB_NAME || "ecommerce",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.DB_LOGGING === "true",
  entities: ["src/entities/**/*.ts"],
  migrations: ["../../migrations/**/*.{ts,js}"],
  subscribers: [],
  extra: {
    max: getPositiveInteger("DB_POOL_MAX", 10),
    min: getPositiveInteger("DB_POOL_MIN", 2),
    idleTimeoutMillis: getPositiveInteger("DB_IDLE_TIMEOUT", 30000),
    connectionTimeoutMillis: getPositiveInteger("DB_CONNECTION_TIMEOUT", 2000),
  },
  cache: {
    type: "database",
    duration: 30000,
  },
});
export default AppDataSource;
