import { publisher , subscriber } from "./redisClient.ts";
import{ Server ,Socket } from "socket.io";
import prisma from "./prismaClient.ts";
export class SocketIo {

    io: Server;
    private socket: Socket | null = null;
    isSubscribed = false;
    constructor(io: Server) {
        this.io = io;
    }
    async init() {
        

        this.io.on("connection", (socket: any) => {
            console.log("New client connected" , socket.id);
            this.socket = socket;

            socket.on("NewMessage", async ({ message , chatId , userId } :{ message: string , chatId: string , userId: string }) => {
                const data = JSON.parse(message);
                if (!data.text || !chatId || !userId) {
                    console.error("Invalid message data");
                    return;
                }
                
                await prisma.message.create({
                    data: {
                        chatId: parseInt(chatId),
                        senderId: parseInt(userId),
                        content: data.text,

                    }
                });
                await publisher.publish("chat", JSON.stringify({ message, chatId, userId }));
            });
            socket.on("disconnect", () => {
                console.log("Client disconnected" , socket.id);
            });
        });
        if (!this.isSubscribed) { 
            await subscriber.subscribe("chat", (message) => {
            const data = JSON.parse(message);
            this.socket?.emit("NewMessage", data);
      });
      this.isSubscribed = true;
    }
    }
}