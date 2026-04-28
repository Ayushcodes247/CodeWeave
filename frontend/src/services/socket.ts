import { io , Socket } from "socket.io-client";
import { Store } from "../store/store";

const URI = import.meta.env.VITE_NODE_ENV === "production" ? import.meta.env.VITE_SOCKET_URL : "http://localhost:3000";

class SocketManager{
    private socket : Socket | null = null;
    private uid : string | null = null;

    connect(uid : string){
        if(this.socket?.connect) return;

        this.uid = uid;
        this.socket = io(URI,{
            autoConnect : false,
            withCredentials : true,
            auth : { token : Store.getState().authentication.accessToken }
        });

        this.socket.connect();

        this.socket.on("connect", () => {
            this.socket?.emit("joinUser", uid);
        });

        this.socket.on("disconnect", () => {
            console.info("Socket disconnected.");
        });
    };

    joinRoom(roomId : string){
        this.socket?.emit("joinRoom",roomId);
    };

    leaveRoom(roomId : string){
        this.socket?.emit("leaveRoom",roomId);
    };

    on(event : string, cb : (...args: any[]) => void){
        this.socket?.off();
        this.socket?.on(event,cb);
    };

    emit(event : string, data : any){
        this.socket?.emit(event,data);
    };

    disconnect(){
        this.socket?.disconnect();
        this.socket = null;
    };

    getSocket(){
        return this.socket;
    }
}

export const socketManager = new SocketManager();