import { HydratedDocument } from "mongoose";
import { IUser } from "@models/user.model";
import { ISession } from "@models/session.model";

declare global {
  namespace Express {
    interface Request{
        user? : HydratedDocument<IUser>,
        dbSession? : ISession
    }
  }
}

export {};
