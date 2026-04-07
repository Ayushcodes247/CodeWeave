import express from "express";
import { routeLimiter } from "@configs/essential.config";
import { register , login, profile} from "@controllers/authentication/index.controller";

export const router = express.Router();

router.post("/register", routeLimiter, register);

router.post("/login", routeLimiter, login);

router.get("/me", routeLimiter, profile);