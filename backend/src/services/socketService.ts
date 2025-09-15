import { publisher, subscriber } from "../lib/redisClient.ts";
import { Server, Socket } from "socket.io";
import prisma from "../lib/prismaClient.ts";
export class SocketIo {
  io: Server;
  private socket: Socket | null = null;
  isSubscribed = false;
  constructor(io: Server) {
    this.io = io;
  }
  async init() {
    this.io.on("connection", (socket: any) => {
      console.log("New client connected", socket.id);
      this.socket = socket;
      socket.on("joinRoom", (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });
      socket.on("leaveRoom", (roomId: string) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
      });

    

      socket.on(
        "NewMessage",
        async (message: {
          id?: string;
          chatId: string;
          senderId: string;
          content: string;
          timestamp: Date;
          messageType: string;
          statuses: string[];
        }) => {
          if (!message.content || !message.chatId || !message.senderId) {
            console.error("Invalid message data");
            return;
          }
          const NewMessage = await prisma.message.create({
            data: {
              chatId: message.chatId,
              senderId: message.senderId,
              content: message.content,
              timeStamp: new Date(),
              messageType: message.messageType,
            },
          });
          console.log("Message saved:", NewMessage);
          
          await publisher.publish(
            "chat",
            JSON.stringify({
              message: NewMessage,
              chatId: message.chatId,
              userId: message.senderId,
            })
          );

          await publisher.publish(
            `notifications:${message.chatId}`,
            JSON.stringify({
              message: NewMessage,
              chatId: message.chatId,
              userId: message.senderId,
            })
          );

        }
      );
      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });
    if (!this.isSubscribed) {
      await subscriber.subscribe("chat", (message) => {
        const data = JSON.parse(message);
        console.log("Publishing to rooms:", data.chatId);
        
        this.io?.to(data.chatId).emit("chat-message", data);
      });
      await subscriber.subscribe("notifications:*", (message, channel) => {
        const data = JSON.parse(message);

        this.io?.to(data.chatId).emit("notification", data);
      });
      this.isSubscribed = true;
    }
  }
}
