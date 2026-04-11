import { User } from "@models/user.model";
import { AppError } from "@utils/essential.util";

interface SafeUser {
  _id: string;
  username: string;
  email: string;
  profilePic?: string | undefined;
}

interface ReturnType {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

interface ArgType {
  email: string;
  password: string;
}

const loginService = async (data: ArgType): Promise<ReturnType> => {
  if (!data || !data.email || !data.password) {
    throw new AppError("Missing login details.", 400);
  }

  const user = await User.findOne({ email: data.email }).select(
    "+password +provider -__v -createdAt -updatedAt",
  );

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.provider !== "local") {
    throw new AppError("Please login using OAuth provider.", 400);
  }

  const isValidPassword = await user.comparePassword(data.password);

  if (!isValidPassword) {
    throw new AppError("Invalid email or password.", 401);
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    },
  };
};

export default loginService;
