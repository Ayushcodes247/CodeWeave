import { RequestHandler, Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.resolve(fn(req, res, next)).catch(next);
  };
};
