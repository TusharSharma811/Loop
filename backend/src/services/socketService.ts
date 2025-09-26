
import { publisher, subscriber } from "../lib/redisClient.js";
import { Server, Socket } from "socket.io";
import prisma from "../lib/prismaClient.js";

interface MessagePayload {
  id?: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp?: Date;
  messageType: string;
  statuses?: string[];
}

export class SocketIo {
  private io: Server;
  private isSubscribed = false;

  constructor(io: Server) {
    this.io = io;
  }

  
  async init() {
    this.io.on("connection", async (socket: Socket) => {
      console.log("New client connected:", socket.id);
      this.registerEventHandlers(socket);
      const userId : string= socket.handshake.query.userId as string;
      if (userId) {
        console.log("User ID from query:", userId);
      }
      const chats = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId: userId
            },
          },
         
        },
         select: { id: true },
      });
      console.log("User's chats:", chats);
      
      chats.forEach((chatId)=>{
        socket.join(chatId.id);
        console.log("User", userId, "joined room:", chatId.id);
        
        socket.to(chatId.id).emit("online-user" , userId)
      })
    });

    await this.setupRedisSubscriptions();
  }

 
  private registerEventHandlers(socket: Socket) {
    socket.on("joinRoom", (roomId: string) => this.handleJoinRoom(socket, roomId));
    socket.on("leaveRoom", (roomId: string) => this.handleLeaveRoom(socket, roomId));
    socket.on("NewMessage", (msg: MessagePayload) => this.handleNewMessage(socket, msg));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  private handleJoinRoom(socket: Socket, roomId: string) {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  }


  private handleLeaveRoom(socket: Socket, roomId: string) {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  }

  
  private async handleNewMessage(socket: Socket, message: MessagePayload) {
    if (!message.content || !message.chatId || !message.senderId) {
      console.error("Invalid message data:", message);
      return;
    }

    try {
      const newMessage = await prisma.message.create({
        data: {
          chatId: message.chatId,
          senderId: message.senderId,
          content: message.content,
          timeStamp: new Date(),
          messageType: message.messageType,
        },
      });

      console.log("Message saved:", newMessage);

      const payload = JSON.stringify({
        message: newMessage,
        chatId: message.chatId,
        userId: message.senderId,
      });

      // Publish to Redis channels
      await publisher.publish("chat", payload);
      await publisher.publish(`notifications:${message.chatId}`, payload);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }

 
  private handleDisconnect(socket: Socket) {
    console.log("Client disconnected:", socket.id);
  }


  private async setupRedisSubscriptions() {
    if (this.isSubscribed) return;

    await subscriber.subscribe("chat", (message) => {
      const data = JSON.parse(message);
      console.log("Broadcasting chat message to room:", data.chatId);
      this.io.to(data.chatId).emit("chat-message", data);
    });

    // If your Redis client supports patterns (pSubscribe), use it instead of multiple `subscribe`
    await subscriber.pSubscribe("notifications:*", (message, channel) => {
      const data = JSON.parse(message);
      console.log("Broadcasting notification from channel:", channel);
      this.io.to(data.chatId).emit("notification", data);
    });

    this.isSubscribed = true;
  }
}
