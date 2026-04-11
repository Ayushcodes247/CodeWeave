import { Request, Response, NextFunction } from "express";
import { Session } from "@models/session.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "@configs/env.config";
import { asyncHandler, AppError } from "@utils/essential.util";

interface verifiedSessionType extends JwtPayload {
  id: string;
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
    } catch (error) {
      return next(new AppError("Unauthorized.", 401));
    };

    const session = await Session.find({ uid : verified._id , revoked : false });
    const validRefreshToken = await session.validRefreshToken(token);
    if(session){
        next()
    }

    console.log("Chal ")
  },
);

export default validateSession;