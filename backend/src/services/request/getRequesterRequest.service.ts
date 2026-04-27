import { RequestModel } from "@models/request.model";
import { AppError } from "@utils/essential.util";
import { Types } from "mongoose";

interface DataObjectType {
  _id: Types.ObjectId;
  page?: number;
  limit?: number;
}

interface RequesterRequestReturnData {
  _id: Types.ObjectId;
  roomName: string;
  roomId: Types.ObjectId;
  uid: Types.ObjectId;
  status: "pending" | "fulfilled" | "rejected";
}

interface ReturnType {
  requests: RequesterRequestReturnData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

const getRequesterRequestService = async (
  data: DataObjectType,
): Promise<ReturnType> => {
  if (!data || !data._id) {
    throw new AppError("Please provide valid user data.", 400);
  }

  const page = Math.max(1, data.page || 1);
  const limit = Math.max(1, Math.min(50, data.limit || 10));
  const skip = (page - 1) * limit;

  const matchStage = {
    $match: { uid: new Types.ObjectId(data._id) },
  };

  const [requests, totalResult] = await Promise.all([
    RequestModel.aggregate<RequesterRequestReturnData>([
      matchStage,
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          roomId: 1,
          uid: "$uid",
          status: 1,
          roomName: "$room.roomName",
        },
      },
    ]),

    RequestModel.aggregate([matchStage, { $count: "total" }]),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    requests,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    message: "Requester requests fetched successfully.",
  };
};

export default getRequesterRequestService;
