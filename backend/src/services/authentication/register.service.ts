import { User, validateUser, IUser } from "@models/user.model";
import { AppError } from "@utils/essential.util";
import { Types } from "mongoose";

interface SafeUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  profilePic: string | undefined;
}

interface ReturnType {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

const registerUser = async (userData: Partial<IUser>): Promise<ReturnType> => {
  if (!userData) {
    throw new AppError("Please provide valid user data.", 400);
  }

  const { value, error } = validateUser({
    ...userData,
    provider: "local",
  });

  if (error) {
    throw new AppError(String(error.details[0]?.message), 400);
  }

  const hashedPassword = await User.hashPassword(value.password!);

  let user;

  try {
    user = await User.create({
      ...value,
      password: hashedPassword,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      throw new AppError("Email is already registered.", 409);
    }
    throw err;
  }

  const accessToken = user.generateAccessToken();

  const refreshToken = user.generateRefreshToken();

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    },
  };
};

export default registerUser;
