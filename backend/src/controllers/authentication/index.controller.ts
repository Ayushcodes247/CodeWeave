import { asyncHandler, AppError } from "@utils/essential.util";
import { Request, Response, NextFunction } from "express";
import registerUser from "@services/authentication/register.service";
import { env } from "@configs/env.config";
import loginService from "@services/authentication/login.service";

const token_name = "auth_token";

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password, gender } = req.body;

    if (!username || !email || !password || !gender) {
      return next(new AppError("All fields are required.", 400));
    }

    const BASE_URL = env.BASE_URL || `http://localhost:${env.PORT}`;

    const genderMap: Record<string, string> = {
      male: "male.png",
      female: "female.png",
    };

    const image = genderMap[gender];
    if (!image) {
      return next(new AppError("Invalid gender provided.", 400));
    }

    const profilePic = `${BASE_URL}/public/images/${image}`;

    const userData = { username, email, password, gender, profilePic };

    const { token, user } = await registerUser(userData);

    res.cookie(token_name, token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      priority: "high",
    });

    res.status(201).json({
      success: true,
      user,
      message: "User Registered successfully.",
    });
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("All fields are required.", 400));
    }

    const { user, token } = await loginService({ email, password });

    res.cookie(token_name, token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      priority: "high",
    });

    res.status(200).json({
      success: true,
      user,
      message: "User logged in successfully.",
    });
  },
);

export const profile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);
