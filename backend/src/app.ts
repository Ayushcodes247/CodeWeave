import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "@configs/env.config";
import {
  globalErrorHandler,
  checkDBStatus,
} from "@middlewares/essential.middleware";
import helmet from "helmet";
import routes from "@routes/index.route";
import { rateLimit } from "express-rate-limit";
import path from "path";

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.ORIGIN,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  }),
);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(checkDBStatus);
app.use(globalErrorHandler);

const masterRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  statusCode: 429,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

app.use("/api/v1/", masterRateLimiter, routes);

export default app;
