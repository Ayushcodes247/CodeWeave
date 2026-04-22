import { Room, IRoom, validateRoom } from "@models/room.model";
import { AppError } from "@utils/essential.util";
import { Types } from "mongoose";
import { User } from "@models/user.model";

interface RoomType {
  _id: Types.ObjectId;
  roomname: string;
  membersCount: number;
}

interface ReturnType {
  inviteCode: string;
  room: RoomType;
}

const createService = async (roomData: Partial<IRoom>): Promise<ReturnType> => {
  if (!roomData || Object.keys(roomData).length === 0) {
    throw new AppError("Please provide valid room data.", 400);
  }

  const { value, error } = validateRoom(roomData);
  if (error) {
    throw new AppError(String(error.details[0]?.message), 400);
  }

  const exists = await Room.findOne({
    roomName: value.roomName,
    owner: value.owner,
  });

  if (exists) {
    throw new AppError("Room with this name already exists.", 400);
  }

  const userExists = await User.exists({ _id: value.owner });
  if (!userExists) {
    throw new AppError("User not found.", 404);
  }

  let room;

  try {
    room = await Room.create({
      ...value,
      members: [
        {
          user: value.owner,
          role: "owner",
        },
      ],
    });
  } catch (err: any) {
    if (err.code === 11000) {
      throw new AppError("Room with this name already exists.", 400);
    }
    throw err;
  }

  const inviteCode = room.generateInviteCode();
  const hashedInviteCode = await Room.hashInviteCode(inviteCode);

  room.inviteCode = hashedInviteCode;
  await room.save();

  await User.findByIdAndUpdate(value.owner, {
    $addToSet: { rooms: room._id },
  });

  return {
    room: {
      _id: room._id,
      roomname: room.roomName,
      membersCount: room.members.length,
    },
    inviteCode,
  };
};

export default createService;
