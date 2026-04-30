import { Model, Schema, Document, Types, model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import crypto from "crypto";
import bcrypt from "bcrypt";

export interface IRoom extends Document {
  _id: Types.ObjectId;
  roomName: string;
  owner: Types.ObjectId;
  mode: "solo" | "team";
  members: {
    user: Types.ObjectId;
    role: "owner" | "editor" | "viewer";
  }[];
  files: Types.ObjectId[];
  inviteCode: string;
  maxMembers: number;
  lastActiveAt: Date;

  generateInviteCode(): string;
  compareInviteCode(inviteCode: string): Promise<boolean>;
}

export interface IRoomModel extends Model<IRoom> {
  hashInviteCode(inviteCode: string): Promise<string>;
}

const roomSchema: Schema<IRoom> = new Schema(
  {
    roomName: {
      type: String,
      minlength: [2, "Min length is 2 characters"],
      maxlength: [50, "Max length is 50 characters"],
      trim: true,
      required: true,
    },

    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    mode: {
      type: String,
      enum: ["solo", "team"],
      default: "solo",
      required: true,
    },

    members: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },

        role: {
          type: String,
          enum: ["owner", "editor", "viewer"],
          default: "viewer",
        },
      },
    ],

    files: [
      {
        type: Types.ObjectId,
      },
    ],

    inviteCode: {
      type: String,
      select: false,
      default: "",
    },

    maxMembers: {
      type: Number,
      default: 1,
      max: [10, "Room can contain upto 10 members."],
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.index({ roomName: 1, owner: 1 }, { unique: true });
roomSchema.index({ inviteCode: 1 });
roomSchema.index({ "members.user": 1 });

roomSchema.methods.generateInviteCode = function (): string {
  return crypto.randomBytes(6).toString("hex");
};

roomSchema.methods.compareInviteCode = async function (
  inviteCode: string,
): Promise<boolean> {
  return await bcrypt.compare(inviteCode, this.inviteCode);
};

roomSchema.statics.hashInviteCode = async function (
  inviteCode: string,
): Promise<string> {
  return await bcrypt.hash(inviteCode, 12);
};

roomSchema.pre("save", async function () {
  const room = this as IRoom;

  if (room.members.length > room.maxMembers) {
    throw new Error("Max members limit exceeded");
  }

  if (room.mode === "solo" && room.members.length > 1) {
    throw new Error("Solo room cannot have multiple members");
  }

  const ownerExists = room.members.some(
    (m) => m.user.toString() === room.owner.toString(),
  );

  if (!ownerExists) {
    room.members.push({
      user: room.owner,
      role: "owner",
    });
  }

  room.lastActiveAt = new Date();
});

export const validateRoom = (room: object): ValidationResult => {
  const schema = Joi.object({
    roomName: Joi.string().max(50).min(2).required(),
    owner: Joi.string().hex().length(24),
    mode: Joi.string().valid("solo", "team").required(),
    maxMembers: Joi.number().max(10).optional(),
  }).unknown(false);

  return schema.validate(room, {
    stripUnknown: true,
    abortEarly: false,
  });
};

export const Room = model<IRoom, IRoomModel>("Room", roomSchema);
