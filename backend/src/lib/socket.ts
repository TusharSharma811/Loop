import { publisher , subscriber } from "./redisClient.ts";
import type{ Server ,Socket } from "socket.io";
import prisma from "./prismaClient.ts";
export class SocketIo {

    io: Server;
    isSubscribed = false;
    constructor(io: Server) {
        this.io = io;
    }
    async init() {

        this.io.on("connection", (socket: any) => {
            console.log("New client connected" , socket.id);

            socket.on("NewMessage", async ({ message , chatId , userId } :{ message: string , chatId: string , userId: string }) => {
                await prisma.message.create({
                    data: {
                        chatId: parseInt(chatId),
                        senderId: parseInt(userId),
                        content: message,
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
            this.io.to(data.chatId).emit("NewMessage", data);
      });
      this.isSubscribed = true;
    }
    }
}