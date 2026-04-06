import express from "express";
import { router as authRouter } from "./authentication/index.route";

const router = express.Router();

router.use("/auth", authRouter);

export default router;