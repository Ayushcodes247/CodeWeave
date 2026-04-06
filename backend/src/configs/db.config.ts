import mongoose from "mongoose";
import { env } from "./env.config";
import { time } from "./essential.config";

export const connectTODB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGOURI, {
      maxPoolSize: 100,
      serverSelectionTimeoutMS: 3_000,
    });
    console.info(`[${time()}] Connected to DATABASE SUCCESSFULLY.`);
  } catch (error: unknown) {
    console.error(
      `[${time()}] Failed to connect to DATABASE. Error: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }

  mongoose.connection.once("disconnected", (): void => {
    console.warn(`[${time()}] Dissconnected from DATABASE.`);
  });

  mongoose.connection.once("error", (error: Error): void => {
    console.error(`[${time()}] Database connection error: ${error}`);
  });

  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal: string): void => {
    process.on(signal, async (): Promise<void> => {
      try {
        await mongoose.connection.close();
        console.info(
          `[${time()}] Database connection closed due to application shutdown.`,
        );
        process.exit(0);
      } catch (error: unknown) {
        console.error(
          `[${time()}] Error during graceful shutdown: ${error instanceof Error ? error.message : error}`,
        );
        process.exit(1);
      }
    });
  });
};
