import { Schema, model, Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

export interface IBlack extends Document {
  token: string;
  expiresAt: Date;
}

const blackSchema: Schema<IBlack> = new Schema(
  {
    token: {
      type: String,
      trim: true,
      index: true,
      match: [
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
        "Invalid JWT format.",
      ],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  },
);

export const ValidateBlack = (data: { token: string }): ValidationResult => {
  const schema = Joi.object({
    token: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/),
  }).unknown(false);

  return schema.validate(data, { abortEarly: false, stripUnknown: true });
};

export const Black = model<IBlack>("Black", blackSchema);
