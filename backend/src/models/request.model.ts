import { Schema, Types, Document, model } from "mongoose";
import Joi, { ValidationResult } from "joi";

export interface IRequest extends Document {
  uid: Types.ObjectId;
  roomId: Types.ObjectId;
  status: "pending" | "fulfilled" | "rejected";
}

const requestSchema: Schema<IRequest> = new Schema(
  {
    uid: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },

    roomId: {
      type: Types.ObjectId,
      required: true,
      ref: "Room",
    },

    status: {
      type: String,
      enum: ["pending", "fulfilled", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.index({ uid: 1, roomId: 1 }, { unique: true });
requestSchema.index({ roomId: 1 });
requestSchema.index({ status: 1 });

export const validateRequest = (data: object): ValidationResult => {
  const schema = Joi.object({
    uid: Joi.string().hex().length(24).required(),
    roomId: Joi.string().hex().length(24).required(),
    status: Joi.string()
      .valid("pending", "fulfilled", "rejected")
      .default("pending"),
  }).unknown(false);

  return schema.validate(data, {
    stripUnknown: true,
    abortEarly: false,
  });
};

export const RequestModel = model("Request", requestSchema);
