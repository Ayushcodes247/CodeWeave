import { Room } from "@models/room.model";
import { AppError } from "@utils/essential.util";
import { Types } from "mongoose";

interface RoomData {
  _id: Types.ObjectId;
  ownerName: string;
  roomName: string;
  membersCount: number;
  maxMembers: number;
  role: string;
}

interface ReturnData {
  room: RoomData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

const getRoomService = async (data: {
  _id: Types.ObjectId;
  page?: number;
  limit?: number;
}): Promise<ReturnData> => {
  if (!data || !data._id) {
    throw new AppError("Please provide valid user data.", 400);
  }

  const page = Math.max(1, data.page || 1);
  const limit = Math.max(1, Math.min(50, data.limit || 10));
  const skip = (page - 1) * limit;

  const userId = new Types.ObjectId(data._id);

  const matchStage = {
    "members.user": userId,
  };

  const [rooms, totalResult] = await Promise.all([
    Room.aggregate<RoomData>([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          roomName: 1,
          maxMembers: 1,
          membersCount: { $size: "$members" },
          ownerName: "$owner.username",
          role: {
            $let: {
              vars: {
                currentMember: {
                  $first: {
                    $filter: {
                      input: "$members",
                      as: "m",
                      cond: {
                        $eq: ["$$m.user", userId],
                      },
                    },
                  },
                },
              },
              in: "$$currentMember.role",
            },
          },
        },
      },
    ]),

    Room.aggregate([
      {
        $match: matchStage,
      },
      {
        $count: "total",
      },
    ]),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    room: rooms,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    message: "Rooms fetched successfully.",
  };
};

export default getRoomService;
