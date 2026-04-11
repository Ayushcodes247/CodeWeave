import { asyncHandler, AppError } from "@utils/essential.util";
import { Request, Response, NextFunction } from "express";
import registerUser from "@services/authentication/register.service";
import { env } from "@configs/env.config";
import loginService from "@services/authentication/login.service";
import inValidateToken from "@services/authentication/logout.service";
import sessionService from "@services/authentication/session.service";

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

    const { accessToken, refreshToken, user } = await registerUser(userData);

    const sessionData = {
      uid: user._id.toString(),
      refreshToken,
      ip: req.ip || "0.0.0.0",
      agent:
        (req.get("user-agent")
          ? req.get("user-agent")
          : req.headers["user-agent"]) || "unknown",
    };
    const { message } = await sessionService(sessionData);

    res.cookie(token_name, refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      priority: "high",
    });

    res.status(201).json({
      success: true,
      accessToken,
      user,
      message: "User Registered successfully." + "and" + `${message}`,
    });
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("All fields are required.", 400));
    }

    const { user, refreshToken, accessToken } = await loginService({
      email,
      password,
    });
    const sessionData = {
      uid: user._id.toString(),
      refreshToken,
      ip: req.ip || "0.0.0.0",
      agent:
        (req.get("user-agent")
          ? req.get("user-agent")
          : req.headers["user-agent"]) || "unknown",
    };
    const { message } = await sessionService(sessionData);

    res.cookie(token_name, refreshToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      priority: "high",
    });

    res.status(200).json({
      success: true,
      accessToken,
      user,
      message: "User logged in successfully and" + `${message}.`,
    });
  },
);

export const profile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
      message: "Profile fetched successfully.",
    });
  },
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.[token_name] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return next(new AppError("Unauthorized. Token missing.", 401));
    }

    await inValidateToken({ token });

    res.clearCookie(token_name, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logout successfully.",
    });
  },
);
