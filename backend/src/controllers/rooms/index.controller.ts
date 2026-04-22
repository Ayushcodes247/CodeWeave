import { Request, Response, NextFunction } from "express";
import { AppError, asyncHandler } from "@utils/essential.util";
import { IUser } from "@models/user.model";
import { HydratedDocument } from "mongoose";
import createService from "@services/rooms/createRoom.service";

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
