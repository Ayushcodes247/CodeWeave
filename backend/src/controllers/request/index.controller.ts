import { Request, Response, NextFunction } from "express";
import requestService from "@services/request/request.service";
import { asyncHandler, AppError } from "@utils/essential.util";
import { IUser } from "@models/user.model";
import { HydratedDocument } from "mongoose";
import getRequest from "@services/request/all.service";

export const requests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as HydratedDocument<IUser>;

    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }

    const { roomId, inviteCode } = req.body;

    const { requestData, message } = await requestService({
      uid: user._id.toString(),
      roomId,
      inviteCode,
    });

    res.status(201).json({
      success: true,
      requestData,
      message,
    });
  },
);

export const accept = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const getRequests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as HydratedDocument<IUser>;

    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }

    const { requests, message , pagination } = await getRequest({ _id: user._id });

    res.status(200).json({
      requests,
      message,
      pagination
    });
  },
);
