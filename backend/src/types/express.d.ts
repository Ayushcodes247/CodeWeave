import { ObjectId } from "mongoose";
import { IUser } from "@models/user.model";
import { ISession } from "@models/session.model";

declare global {
  namespace Express {
    interface Request{
        user? : IUser,
        session? : ISession
    }
  }
}

export {};
