import express from "express";
import { routeLimiter } from "@configs/essential.config";
import isAuthenticated from "@middlewares/auth.middleware";
import { create, search , getRoom } from "@controllers/rooms/index.controller";

export const router = express.Router();

router.post("/create", routeLimiter, isAuthenticated, create);

router.post("/search", routeLimiter, isAuthenticated, search);

router.get("/get-room", routeLimiter, isAuthenticated, getRoom);