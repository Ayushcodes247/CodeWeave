import { io, Socket } from "socket.io-client";
import { Store } from "../store/store";

const URI =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_SOCKET_URL
    : "http://localhost:3000";

class SocketManager {
  private socket: Socket | null = null;
  private uid: string | null = null;

  connect(uid: string) {
    if (this.socket?.connected) return;

    this.uid = uid;

    this.socket = io(URI, {
      autoConnect: false,
      withCredentials: true,
      auth: {
        token: Store.getState().authentication.accessToken,
      },
    });

    this.socket.connect();

    this.socket.on("connect", () => {
      console.info("Socket connected:", this.socket?.id);

      this.socket?.emit("joinUser", uid);
    });

    this.socket.on("disconnect", () => {
      console.info("Socket disconnected");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }

  on(event: string, cb: (...args: any[]) => void) {
    this.socket?.on(event, cb);
  }

  off(event: string, cb?: (...args: any[]) => void) {
    if (cb) {
      this.socket?.off(event, cb);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  joinRoom(roomId: string) {
    this.socket?.emit("joinRoom", roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit("leaveRoom", roomId);
  }

  disconnect() {
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
    this.uid = null;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
