import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { AppError } from "utils/essential.util";

export const checkDBStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (mongoose.connection.readyState !== 1) {
    return next(new AppError("Database connection is not established.", 503));
  }

  next();
};

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const isOperational = error instanceof AppError;

  const statusCode = isOperational ? (error as AppError).statusCode : 500;
  const message = isOperational
    ? (error as AppError).message
    : "Internal server error.";

  if (!isOperational) {
    console.error(`Error:[${req.method}/${req.originalUrl}]`);
    console.error(`Error Stack: ${error.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
