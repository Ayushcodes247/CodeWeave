import { Black, ValidateBlack } from "@models/blacklist.model";
import { AppError } from "@utils/essential.util";

interface ReturnType {
  token: string;
  expiresAt: Date;
}

const inValidateToken = async (data: {
  token: string;
}): Promise<ReturnType> => {
  if (!data || !data.token) {
    throw new AppError("Token not provided.", 400);
  }

  const { value, error } = ValidateBlack(data);

  if (error) {
    throw new AppError(String(error.details[0]?.message), 400);
  }

  let retDat;

  try {
    retDat = await Black.create(value);
  } catch (err: any) {
    if (err.code === 11000) {
      throw new AppError("Token already invalidated.", 400);
    }
    throw err;
  }

  return {
    token: retDat.token,
    expiresAt: retDat.expiresAt,
  };
};

export default inValidateToken;
