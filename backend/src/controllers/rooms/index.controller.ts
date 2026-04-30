import { Request, Response, NextFunction } from "express";
import { AppError, asyncHandler } from "@utils/essential.util";
import { IUser } from "@models/user.model";
import { HydratedDocument } from "mongoose";
import createService from "@services/rooms/createRoom.service";
import searchService from "@services/rooms/search.service";
import { Types } from "mongoose";
import getRoomService from "@services/rooms/getRoom.service";

export const create = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as HydratedDocument<IUser>;

    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }

    const { roomName, mode, maxMembers } = req.body;

    if (!roomName || !mode) {
      throw new AppError("roomName and mode are required.", 400);
    }

    const roomData = {
      roomName,
      mode,
      owner: user._id.toString(),
      ...(maxMembers && { maxMembers }),
    };

    const { room, inviteCode } = await createService(roomData);

    res.status(201).json({
      success: true,
      room,
      inviteCode,
      message: "Room created successfully.",
    });
  },
);

export const search = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as HydratedDocument<IUser>;

    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }

    const { roomId } = req.body;

    if (!roomId) {
      throw new AppError("Invalid room id.", 400);
    }

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError("Invalid room id.", 400);
    }

    const { room, message } = await searchService(roomId);

    res.status(200).json({
      success: true,
      room,
      message,
    });
  },
);

export const getRoom = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as HydratedDocument<IUser>;

    if (!user) {
      throw new AppError("Unauthorized.", 401);
    }

    const pageRaw = Number(req.query.page);
    const limitRaw = Number(req.query.limit);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;

    const { room, pagination, message } = await getRoomService({
      _id: user._id,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      room,
      pagination,
      message,
    });
  },
);
