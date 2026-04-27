import app from "./app";
import http from "http";
import { env } from "@configs/env.config";
import { time } from "@configs/essential.config";
import { connectTODB } from "@configs/db.config";
import { InitializeSocketServer } from "./socket";

const server = http.createServer(app);
const PORT = env.PORT;

(async (): Promise<void> => {
  try {
    await connectTODB();
    InitializeSocketServer(server);

    server.listen(PORT, (): void => {
      console.info(`[${time()}] Server is running on port: ${env.PORT}`);
    });
  } catch (error: unknown) {
    console.error(
      `[${time()}] server initialization failed. Error: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
})();

process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>): void => {
    console.error(
      `[${time()}] Unhandled Rejection : ${promise}, reason : ${reason instanceof Error ? reason.message : reason}`,
    );
  },
);

process.on("uncaughtException", (error: Error): void => {
  console.error(`[${time()}] Uncaught Excpetion : ${error}`);
  process.exit(1);
});

const gracefulShutdown = (signal: string): void => {
  console.info(
    `[${time()}] Received ${signal}. Initiating graceful shutdown...`,
  );

  server.close((): void => {
    console.info(`[${time()}] Server closed successfully.`);
    process.exit(0);
  });

  setTimeout((): void => {
    console.warn(
      `[${time()}] Server cannot be gracefully shutdown. Forcefully shutting down...`,
    );
    process.exit(1);
  }, 3_000);
};

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal: string): void => {
  process.once(signal, (): void => gracefulShutdown(signal));
});
