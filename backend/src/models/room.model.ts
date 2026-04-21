import { Schema, Document, Types, model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import jwt from "jsonwebtoken";

export interface IRoom extends Document {
  roomName: string;
  owner: Types.ObjectId;
  mode: "solo" | "team";
  members: [users: Types.ObjectId[], role: string];
  files: Types.ObjectId[];
  inviteCode: string;
  maxMembers: number;
  lastActiveAt: Date;
  generateInviteCode(): string;
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
    },

    members: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
        },

        role: {
          type: String,
          enum: ["editor", "viewer"],
          default: "viewer",
        },
      },
    ],

    files: [
      {
        type: Types.ObjectId,
        // ref : "File"
      },
    ],

    maxMembers: {
      type: Number,
      default: 10,
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

export const Room = model<IRoom>("Room", roomSchema);
