import { asyncHandler, AppError } from "@utils/essential.util";
import { Request, Response, NextFunction } from "express";
import registerUser from "@services/authentication/register.service";
import { env } from "@configs/env.config";
import loginService from "@services/authentication/login.service";
import inValidateToken from "@services/authentication/logout.service";
import sessionService from "@services/authentication/session.service";
import { Session } from "@models/session.model";
import { User } from "@models/user.model";

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

    const exists = await User.findOne({ email: userData.email! });
    if (exists) {
      return next(new AppError("User Already exists.", 409));
    }

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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies?.[token_name];
    const user = req.user;
    const accessToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!user) {
      return next(new AppError("Unauthorized.", 401));
    }

    if (!refreshToken) {
      return next(new AppError("Token missing.", 401));
    }

    const agent = req.get("user-agent");
    const session = await Session.findOne({
      uid: user._id,
      revoked: false,
      agent: String(agent),
    });

    if (!session) {
      return next(new AppError("Session not found.", 404));
    }

    const isValid = await session.validRefreshToken(refreshToken);

    if (!isValid) {
      return next(new AppError("Invalid session.", 401));
    }

    session.revoked = true;
    await session.save();

    res.clearCookie(token_name, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

    await inValidateToken({ token: String(accessToken) });

    res.status(200).json({
      success: true,
      message: "Logout successfully.",
    });
  },
);

export const logoutAll = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;

    const accessToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!user) {
      return next(new AppError("Unauthorized.", 401));
    }

    const result = await Session.updateMany(
      { uid: user._id, revoked: false },
      { $set: { revoked: true } },
    );

    if (result.matchedCount === 0) {
      return next(new AppError("No active sessions found.", 404));
    }

    res.clearCookie(token_name, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

    if (accessToken) {
      await inValidateToken({ token: accessToken });
    }

    res.status(200).json({
      success: true,
      message: "Logged out from all devices.",
    });
  },
);

export const refresh = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.[token_name];
    const session = req.session;

    if (!token) {
      return next(new AppError("Refresh token missing.", 401));
    }

    if (!session) {
      return next(new AppError("Session not found.", 404));
    }

    if (session.revoked) {
      return next(new AppError("Session revoked.", 401));
    }

    const isValid = await session.validRefreshToken(token);

    if (!isValid) {
      session.revoked = true;
      await session.save();

      return next(new AppError("Session compromised.", 401));
    }

    const user = await User.findById(session.uid);
    if (!user) {
      return next(new AppError("Unauthorized.", 401));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const hashedRefreshToken = await Session.hashRefreshToken(refreshToken);

    session.refreshToken = hashedRefreshToken;
    await session.save();

    res.cookie(token_name, refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      priority: "high",
    });

    res.status(200).json({
      success: true,
      accessToken,
      message: "Tokens refreshed successfully.",
    });
  },
);
