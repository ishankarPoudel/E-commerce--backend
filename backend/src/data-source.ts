import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "root",
  password: "classmate",
  database: "ecommerce",
  synchronize: true,
  logging: true,
  subscribers: [],
  migrations: [],
});
