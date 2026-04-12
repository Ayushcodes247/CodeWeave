import express from "express";
import { routeLimiter } from "@configs/essential.config";
import { register , login, profile, logout, logoutAll, refresh} from "@controllers/authentication/index.controller";
import isAuthenticated from "@middlewares/auth.middleware";
import validateSession from "@middlewares/session.middleware";

export const router = express.Router();

router.post("/register", routeLimiter, register);

router.post("/login", routeLimiter, login);

router.get("/me", routeLimiter, isAuthenticated,profile);

router.post("/logout-one", routeLimiter,isAuthenticated, logout);

router.post("/logout-all", routeLimiter , isAuthenticated, logoutAll);

router.get("/refresh", routeLimiter, validateSession, refresh);