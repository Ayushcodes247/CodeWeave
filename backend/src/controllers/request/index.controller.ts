import { Request, Response, NextFunction } from "express";
import requestService from "@services/request/request.service";
import { asyncHandler, AppError } from "@utils/essential.util";
import { IUser } from "@models/user.model";
import { HydratedDocument } from "mongoose";
import getRequest from "@services/request/all.service";
import acceptService from "@services/request/accept.service";
import { Room } from "@models/room.model";
import { Types } from "mongoose";
import rejectService from "@services/request/reject.service";

export const requests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as HydratedDocument<IUser>;
    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }
    const { roomId, uid } = req.body || {};

    if (!roomId || !uid) {
      throw new AppError("roomId and uid are required.", 400);
    }

    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(uid)) {
      throw new AppError("Invalid roomId or uid.", 400);
    }

    const room = await Room.findById(roomId).select("owner");
    if (!room) {
      throw new AppError("Room not found.", 404);
    }

    if (room.owner.toString() !== user._id.toString()) {
      throw new AppError("Only owner can accept requests.", 403);
    }

    const { reqsReturn, message } = await acceptService({
      uid: new Types.ObjectId(uid),
      roomId: new Types.ObjectId(roomId),
    });

    res.status(200).json({
      success: true,
      reqsReturn,
      message,
    });
  },
);

export const reject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as HydratedDocument<IUser>;

    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }

    const { roomId, uid } = req.body || {};

    if (!roomId || !uid) {
      throw new AppError("roomId and uid are required.", 400);
    }

    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(uid)) {
      throw new AppError("Invalid roomId or uid.", 400);
    }

    const room = await Room.findById(roomId).select("owner");
    if (!room) {
      throw new AppError("Room not found.", 404);
    }

    if (room.owner.toString() !== user._id.toString()) {
      throw new AppError("Only owner can reject requests.", 403);
    }

    const { reqsReturn, message } = await rejectService({
      roomId: new Types.ObjectId(roomId),
      uid: new Types.ObjectId(uid),
    });

    res.status(200).json({
      success: true,
      reqsReturn,
      message,
    });
  },
);

export const getRequests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as HydratedDocument<IUser>;

    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }

    const { requests, message, pagination } = await getRequest({
      _id: user._id,
    });

    res.status(200).json({
      requests,
      message,
      pagination,
    });
  },
);
