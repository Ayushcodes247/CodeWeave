import express from "express";
import { routeLimiter } from "@configs/essential.config";
import { register , login, profile, logout} from "@controllers/authentication/index.controller";
import isAuthenticated from "@middlewares/auth.middleware";
import validateSession from "@middlewares/session.middleware";

export const router = express.Router();

router.post("/register", routeLimiter, register);

router.post("/login", routeLimiter, login);

router.get("/me", routeLimiter, isAuthenticated, validateSession,profile);

router.post("/logout", routeLimiter,isAuthenticated, logout);