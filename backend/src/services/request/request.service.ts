import { RequestModel, validateRequest } from "@models/request.model";
import { Types } from "mongoose";
import { Room } from "@models/room.model";
import { AppError } from "@utils/essential.util";
import { getIO } from "@/socket";

interface RequestDataType {
  uid: Types.ObjectId | string;
  roomId: Types.ObjectId;
  inviteCode: string;
}

interface RequestType {
  _id: Types.ObjectId;
  status: "pending" | "fulfilled" | "rejected";
  roomName: string | undefined;
  roomId: Types.ObjectId;
}

interface ReturnType {
  requestData: RequestType;
  message: string;
}

const requestService = async (
  requestData: RequestDataType,
): Promise<ReturnType> => {
  if (!requestData || Object.keys(requestData).length === 0) {
    throw new AppError("Please provide valid room data.", 400);
  }

  const room = await Room.findById(requestData.roomId)
    .populate("owner")
    .select("+inviteCode members maxMembers");

  if (!room) {
    throw new AppError("Room not found.", 404);
  }

  if (room.owner._id.toString() === requestData.uid.toString()) {
    throw new AppError("Owner can not make request to it's own room", 401);
  }

  const isValidInviteCode = await room.compareInviteCode(
    requestData.inviteCode,
  );

  if (!isValidInviteCode) {
    throw new AppError("Invalid invite code", 401);
  }

  const existingRequest = await RequestModel.findOne({
    uid: requestData.uid,
    roomId: requestData.roomId,
  });

  if (existingRequest) {
    throw new AppError("Request already exists.", 400);
  }

  if (room.members.length >= room.maxMembers) {
    throw new AppError("Room is full.", 400);
  }

  const dataObject = {
    uid: requestData.uid,
    roomId: requestData.roomId,
    status: "pending",
  };

  const { value, error } = validateRequest(dataObject);

  if (error) {
    throw new AppError(String(error.details[0]?.message), 400);
  }

  const request = await RequestModel.create(value);
  const io = getIO();

  io.to(`user:${room.owner._id}`).emit("request:new", {
    roomId: room._id,
    requesterId: request.uid,
    roomName: room.roomName,
  });

  return {
    requestData: {
      _id: request._id,
      roomId: request.roomId,
      roomName: room.roomName,
      status: request.status,
    },
    message: "Request created successfully.",
  };
};

export default requestService;
