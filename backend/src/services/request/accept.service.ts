import { RequestModel } from "@models/request.model";
import { Room } from "@models/room.model";
import { Types } from "mongoose";
import { AppError } from "@utils/essential.util";
import { getIO } from "@/socket";

interface DataType {
  roomId: Types.ObjectId;
  uid: Types.ObjectId;
}

interface RequestReturnType {
  _id: Types.ObjectId;
  roomName: string;
  roomId: Types.ObjectId;
  uid: Types.ObjectId;
  status: "pending" | "fulfilled" | "rejected";
}

interface ReturnDataType {
  reqsReturn: RequestReturnType;
  message: string;
}

const acceptService = async (data: DataType): Promise<ReturnDataType> => {
  if (!data || !data.roomId || !data.uid) {
    throw new AppError("Please provide valid user data.", 400);
  }

  const request = await RequestModel.findOne({
    roomId: data.roomId,
    uid: data.uid,
    status: "pending",
  });

  if (!request) {
    throw new AppError("Request not found.", 404);
  }

  const room = await Room.findById(request.roomId);
  if (!room) {
    throw new AppError("Room not found.", 404);
  }

  const alreadyMember = room.members.some(
    (m) => m.user.toString() === request.uid.toString(),
  );

  if (alreadyMember) {
    throw new AppError("User already in room.", 400);
  }

  if (room.members.length >= room.maxMembers) {
    throw new AppError("Room is full.", 400);
  }

  request.status = "fulfilled";
  await request.save();

  room.members.push({
    user: request.uid,
    role: "viewer",
  });

  await room.save();
  const io = getIO();

  io.to(`user:${request.uid}`).emit("request:accepted", {
    roomId: room._id,
    roomName: room.roomName,
    status: request.status,
  });

  return {
    reqsReturn: {
      _id: request._id,
      roomName: room.roomName,
      roomId: request.roomId,
      uid: request.uid,
      status: request.status,
    },
    message: "Request accepted successfully.",
  };
};

export default acceptService;
