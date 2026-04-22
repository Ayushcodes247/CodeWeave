import express from "express";
import { router as authRouter } from "./authentication/index.route";
import { router as roomRouter } from "./rooms/index.route";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/room", roomRouter)

export default router;