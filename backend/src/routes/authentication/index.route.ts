import express, { Request, Response, NextFunction } from "express";
import { routeLimiter } from "@configs/essential.config";
import { register } from "@controllers/authentication/index.controller";

export const router = express.Router();

router.post("/register", routeLimiter, register);
