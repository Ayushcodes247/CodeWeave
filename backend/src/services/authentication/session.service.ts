import {
  Session,
  validateSessionSchema,
  ISession,
} from "@models/session.model";
import { AppError } from "@utils/essential.util";
import { Types } from "mongoose";

interface SessionDataType {
  uid: string;
  refreshToken: string;
  agent: string;
  ip: string;
}

interface ReturnType {
  _id: Types.ObjectId;
  message: string;
}

const sessionService = async (
  sessionData: SessionDataType,
): Promise<ReturnType> => {
  if (
    !sessionData ||
    !sessionData.uid ||
    !sessionData.refreshToken ||
    !sessionData.agent ||
    !sessionData.ip
  ) {
    throw new AppError(
      `invalid session data. ${(sessionData.agent, "ip:", sessionData.ip, "refresh token:", sessionData.refreshToken, "uid", sessionData.uid)}`,
      400,
    );
  }

  const { value, error } = validateSessionSchema({
    ...sessionData,
    revoked: false,
  });
  if (error) {
    throw new AppError(`${error}`, 400);
  }

  const hashRefreshToken = await Session.hashRefreshToken(value.refreshToken);

  const session = await Session.create({
    ...value,
    uid: new Types.ObjectId(value.uid),
    refreshToken: hashRefreshToken,
  });

  return {
    _id: session._id,
    message: "Session created Successfully.",
  };
};

export default sessionService;
