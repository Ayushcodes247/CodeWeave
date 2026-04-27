import { Server } from "socket.io";
import { env } from "@configs/env.config";
import { time } from "@configs/essential.config";

let io: Server;

export const InitializeSocketServer = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: env.ORIGIN,
      methods: ["GET", "POST", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.info(`[${time()}] User connected: ${socket.id}`);

    socket.on("joinUser", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("joinRoom", (roomId: string) => {
      socket.join(`room:${roomId}`);
    });

    socket.on("disconnect", () => {
      console.info(`[${time()}] User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket server not initialized.");
  console.info(`[${time()}] Socket server initialized.`);
  return io;
};
