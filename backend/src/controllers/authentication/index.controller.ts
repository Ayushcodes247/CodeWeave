import { asyncHandler, AppError } from "@utils/essential.util";
import { Request, Response, NextFunction } from "express";
import registerUser from "@services/authentication/register.service";
import { env } from "@configs/env.config";

const token_name = "auth_token";

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, gender } = req.body;
    let profilePic: string;
    if (gender === "male") {
      profilePic = `http://localhost:${env.PORT}/public/images/male.png`;
    } else if (gender === "female") {
      profilePic = `http://localhost:${env.PORT}/public/images/female.png`;
    } else {
      return next(new AppError("Invalid gender provided.", 400));
    }

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

export const login = asyncHandler(async (req : Request, res : Response , next : NextFunction) => {

});
