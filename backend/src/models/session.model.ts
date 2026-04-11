import { Schema, Model, Document, model, Types } from "mongoose";
import Joi, { ValidationResult } from "joi";
import bcrypt from "bcrypt";

export interface ISession extends Document {
  uid: Types.ObjectId;
  ip?: string;
  refreshToken: string;
  agent?: string;
  revoked: boolean;
  validRefreshToken(refreshToken: string): Promise<boolean>;
}

export interface ISessionModel extends Model<ISession> {
  hashRefreshToken(refreshToken: string): Promise<string>;
}

const sessionSchema: Schema<ISession, ISessionModel> = new Schema(
  {
    uid: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref : "User"
    },

    ip: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    agent: {
      type: String,
      required: true,
      default: "",
    },

    revoked: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ uid: 1, refreshToken: 1 });

sessionSchema.methods.validRefreshToken = async function (
  refreshToken: string,
): Promise<boolean> {
  return await bcrypt.compare(refreshToken, this.refreshToken);
};

sessionSchema.statics.hashRefreshToken = async function (
  refreshToken: string,
): Promise<string> {
  return await bcrypt.hash(refreshToken, 12);
};

export function validateSessionSchema(
  session: object,
): ValidationResult {
  const schema = Joi.object({
    uid: Joi.string().hex().length(24).required(),
    ip: Joi.string().required(),
    refreshToken: Joi.string().required(),
    agent: Joi.string().required(),
    revoked: Joi.boolean().required(),
  }).unknown(false);

  return schema.validate(session, { abortEarly: false, stripUnknown: true });
}

export const Session = model<ISession, ISessionModel>("Session", sessionSchema);
