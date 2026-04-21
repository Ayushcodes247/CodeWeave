import { Model, Schema, Document, Types, model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@configs/env.config";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  provider: "local" | "github";
  githubID?: string;
  profilePic?: string;
  rooms?: Types.ObjectId[];
  gender: string;
  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export interface IUserModel extends Model<IUser> {
  hashPassword(password: string): Promise<string>;
}

const userSchema: Schema<IUser, IUserModel> = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: [50, "Username cannot be more than 50 characters"],
      minLength: [2, "Username cannot be less than 2 characters"],
    },

    email: {
      type: String,
      required: function (): boolean {
        return this.provider === "local";
      },
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: function (): boolean {
        return this.provider === "local";
      },
      minLength: [4, "Password cannot be less than 4 characters."],
      select: false,
    },

    gender: {
      type: String,
      required: function (): boolean {
        return this.provider === "local";
      },
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },

    provider: {
      type: String,
      enum: ["local", "github"],
      default: "local",
      required: true,
      select: false,
    },

    githubID: {
      type: String,
      required: function (): boolean {
        return this.provider === "github";
      },
      select: function (): boolean {
        return this.provider === "github";
      },
    },

    profilePic: {
      type: String,
      required: false,
      default: "",
    },

    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { githubID: 1 },
  {
    unique: true,
    partialFilterExpression: { githubID: { $exists: true } },
  },
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } },
);

userSchema.index({ username: 1 });

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign({ _id: this._id }, env.SECRET, {
    expiresIn: "15m",
    algorithm: "HS256",
  });
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign({ _id: this._id }, env.SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (
  password: string,
): Promise<string> {
  return await bcrypt.hash(password, 12);
};

export const validateUser = (user: object): ValidationResult => {
  const schema = Joi.object({
    username: Joi.string().max(50).min(2).required(),
    email: Joi.string()
      .email()
      .when("provider", { is: "local", then: Joi.required() }),
    password: Joi.string()
      .min(4)
      .when("provider", { is: "local", then: Joi.required() }),
    provider: Joi.string().valid("local", "github").required(),
    githubID: Joi.string().when("provider", {
      is: "github",
      then: Joi.required(),
    }),
    gender: Joi.string()
      .valid("male", "female", "unknown")
      .default("unknown")
      .when("provider", { is: "local", then: Joi.required() }),
    profilePic: Joi.string().uri().optional(),
    rooms: Joi.array().items(Joi.string().hex().length(24)).optional(),
  }).unknown(false);

  return schema.validate(user, { abortEarly: false, stripUnknown: true });
};

export const User = model<IUser, IUserModel>("User", userSchema);
