import { Request, Response, NextFunction } from "express";
import { Session , ISession } from "@models/session.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "@configs/env.config";
import { asyncHandler, AppError } from "@utils/essential.util";

interface verifiedSessionType extends JwtPayload {
  _id: string;
}

const TOKEN_NAME = "auth_token";

const validateSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.[TOKEN_NAME];
    if (!token) {
      return next(new AppError("Refresh token is missing.", 401));
    }

    let verified: verifiedSessionType;

    try {
      verified = jwt.verify(token, env.SECRET, {
        algorithms: ["HS256"],
      }) as verifiedSessionType;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(new AppError("Refresh token expired.", 401));
      }
      return next(new AppError("Unauthorized.", 401));
    }

    const session = await Session.findOne({
      uid: verified._id,
      revoked: false,
    });

    if (!session) {
      return next(new AppError("Session not found.", 401));
    }

    const isValid = await session.validRefreshToken(token);

    if (!isValid) {
      return next(new AppError("Invalid refresh token.", 401));
    }

    req.dbSession = session;

    return next();
  },
);

export default validateSession;
