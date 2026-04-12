import { AppError, asyncHandler } from "@utils/essential.util";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "@configs/env.config";
import { User } from "@models/user.model";
import { Black } from "@models/blacklist.model";

interface VerifiedType extends JwtPayload {
  _id: string;
}

const isAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) {
      return next(new AppError("Authentication token is missing.", 401));
    }

    let verified: VerifiedType;

    try {
      verified = jwt.verify(token, env.SECRET, {
        algorithms: ["HS256"],
      }) as VerifiedType;
    } catch (error) {
      return next(new AppError("Unauthorized.", 401));
    }

    const isBlacked = await Black.findOne({ token });
    if (isBlacked) {
      return next(new AppError("Invalid Access token.", 401));
    }

    const user = await User.findById(verified._id).select(
      "_id username email profilePic",
    );

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    req.user = user;

    next();
  },
);

export default isAuthenticated;
