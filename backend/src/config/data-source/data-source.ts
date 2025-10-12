import { join } from "path";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "classmate",
  database: "ecommerce",
  synchronize: false,
  // logging: true,
  entities: ["src/entities/**/*.ts"],
  migrations: [join(__dirname, "../../migrations/**/*.{ts,js}")],
  subscribers: [],
});
export default AppDataSource;
