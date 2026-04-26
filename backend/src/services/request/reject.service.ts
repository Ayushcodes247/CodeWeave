import { RequestModel } from "@models/request.model";
import { AppError } from "@utils/essential.util";
import { Types } from "mongoose";
import { Room } from "@models/room.model";

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

const rejectService = async (data: DataType): Promise<ReturnDataType> => {
  if (!data || !data.roomId || !data.uid) {
    throw new AppError("Please provide valid user data.", 400);
  }

  const request = await RequestModel.findOne({
    roomId: data.roomId,
    uid: data.uid,
  });

  if (!request) {
    throw new AppError("Request not found.", 404);
  }

  if (request.status !== "pending") {
    throw new AppError("Request already processed.", 400);
  }

  const room = await Room.findById(request.roomId).select("roomName");
  if (!room) {
    throw new AppError("Room not found.", 404);
  }

  request.status = "rejected";
  await request.save();

  return {
    reqsReturn: {
      _id: request._id,
      roomName: room.roomName,
      roomId: request.roomId,
      uid: request.uid,
      status: request.status,
    },
    message: "Request rejected successfully.",
  };
};

export default rejectService;
