import { rateLimit } from "express-rate-limit";

export const time = (): string => new Date().toISOString();

export const routeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    error: "Too many requests from this IP, Please Try again after 5 minutes.",
  },
});
