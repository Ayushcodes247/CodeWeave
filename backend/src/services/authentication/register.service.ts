import { User, validateUser, IUser } from "@models/user.model";
import { AppError } from "@utils/essential.util";

interface ReturnType {
  token: string;
  user: object;
}

const registerUser = async (userData: Partial<IUser>): Promise<ReturnType> => {
  if (!userData) {
    throw new Error("Please valid provide user data for user registration.");
  }

  const isExists = await User.findOne({ email: userData.email! }).lean();
  if (isExists) {
    throw new AppError("Email is already registered.", 409);
  }

  const { value, error } = validateUser({ ...userData, provider: "local" });
  if (error) {
    throw new AppError(String(error.details[0]?.message), 400);
  }

  const hashedPasscode = await User.hashPassword(value.password!);

  const user = await User.create({ ...value, password: hashedPasscode });

  const token = user.generateAuthToken();

  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    },
  };
};

export default registerUser;
