import { Room } from "@models/room.model";
import { AppError } from "@utils/essential.util";
import { Types } from "mongoose";

interface RoomType {
  _id: Types.ObjectId;
  roomName: string;
  ownerName: string;
  ownerId: Types.ObjectId;
  lastActivatedAt: Date;
  createdAt: Date;
  mode: string;
}

interface ReturnType {
  room: RoomType;
  message: string;
}

const searchService = async (roomId: string): Promise<ReturnType> => {
  const room = await Room.findById(roomId)
    .populate("owner", "username")
    .select("_id roomName owner mode lastActiveAt").lean();

  if (!room) {
    throw new AppError("room not found.", 404);
  }

  const owner = room.owner as any;

  return {
    room: {
      _id: room._id,
      roomName: room.roomName,
      ownerId: owner._id,
      ownerName: owner.username,
      mode: room.mode,
      lastActivatedAt: room.lastActiveAt,
      createdAt: room._id.getTimestamp(),
    },
    message: "room searched successfully.",
  };
};

export default searchService;
