import express from "express";
import { routeLimiter } from "@configs/essential.config";
import { accept, getRequests, reject, requesterRequest, requests } from "@controllers/request/index.controller"
import isAuthenticated from "@middlewares/auth.middleware";

export const router = express.Router();

router.post("/", routeLimiter, isAuthenticated, requests);

router.patch("/accept", routeLimiter, isAuthenticated, accept);

router.patch("/reject", routeLimiter, isAuthenticated, reject);

router.get("/all-general", routeLimiter, isAuthenticated, getRequests);

router.get("/all-requester", routeLimiter, isAuthenticated, requesterRequest);