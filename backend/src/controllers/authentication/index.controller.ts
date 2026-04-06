import { asyncHandler, AppError } from "@utils/essential.util";
import { Request, Response, NextFunction } from "express";

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);
