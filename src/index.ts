import "dotenv/config";
import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes/routes";
import * as swaggerDocument from "../public/swagger.json";
import { errorHandler } from "./middlewares/errorhandler.middleware";
import cookieParser from "cookie-parser";
import path from "path";
import { authMiddlewareWithExclusions } from "./middlewares/authExclude.middleware";
import { stripeWebHook } from "./config/stripe/routes/stripeWebhook.route";
import AppDataSource from "./config/data-source/data-source";
import { seedInitialAdmin } from "./seeders/seed-initial-admin";

const app = express();

// Enable trust proxy for Render (fixes rate-limit error)
app.set("trust proxy", 1);

app.use(stripeWebHook);
app.use(cookieParser());

//  CORS for production
const allowedOrigins = [
  "http://localhost:5173",
  "https://shankarpoudel.com",
  "https://www.shankarpoudel.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/swagger.json", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

app.use(authMiddlewareWithExclusions as express.RequestHandler);

RegisterRoutes(app);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connection initialized");
    seedInitialAdmin();

    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
    });
  })
  .catch((error) => {
    console.error(" Failed to initialize Data Source", error);
  });
