import { publisher, subscriber } from "../lib/redisClient.js";
import { Server, Socket } from "socket.io";
import prisma from "../lib/prismaClient.js";
import { saveMessage } from "./messageService.js";
import logger from "../utils/logger.js";
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
      logger.info("New client connected:", socket.id);
      this.registerEventHandlers(socket);
      const userId: string = socket.handshake.query.userId as string;
      if (userId) {
        logger.debug("User ID from query:", userId);
      }
      const chats = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
        select: { id: true },
      });
      logger.debug("User's chats:", chats);

      chats.forEach((chatId) => {
        socket.join(chatId.id);
        logger.debug("User", userId, "joined room:", chatId.id);

        socket.to(chatId.id).emit("online-user", userId);
      });
    });

    await this.setupRedisSubscriptions();
  }

  private registerEventHandlers(socket: Socket) {
    socket.on("joinRoom", (roomId: string) =>
      this.handleJoinRoom(socket, roomId)
    );
    socket.on("leaveRoom", (roomId: string) =>
      this.handleLeaveRoom(socket, roomId)
    );
    socket.on("NewMessage", (msg: MessagePayload, type?: string) =>
      this.handleNewMessage(socket, msg, type)
    );
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  private handleJoinRoom(socket: Socket, roomId: string) {
    socket.join(roomId);
    logger.debug(`Socket ${socket.id} joined room ${roomId}`);
  }

  private handleLeaveRoom(socket: Socket, roomId: string) {
    socket.leave(roomId);
    logger.debug(`Socket ${socket.id} left room ${roomId}`);
  }

  private async handleNewMessage(
    socket: Socket,
    message: MessagePayload,
    messageType?: string
  ) {
    if (!message.content || !message.chatId || !message.senderId) {
      logger.warn("Invalid message data:", message);
      return;
    }
    let newMessage : any;
    logger.debug("Received new message:", message, "of type:", messageType);
    
    try {
      newMessage = await saveMessage({
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType || messageType || 'text',
      });

      logger.debug("Message saved:", newMessage);

      const payload = JSON.stringify({
        message: newMessage,
        chatId: message.chatId,
        userId: message.senderId,
      });

      // Publish to Redis channels
      await publisher.publish("chat", payload);
      await publisher.publish(`notifications:${message.chatId}`, payload);
    } catch (error) {
      logger.error("Error saving message:", error);
    }
  }

  private handleDisconnect(socket: Socket) {
    logger.debug("Client disconnected:", socket.id);
  }

  private async setupRedisSubscriptions() {
    if (this.isSubscribed) return;

    await subscriber.subscribe("chat", (message) => {
      const data = JSON.parse(message);
      logger.debug("Broadcasting chat message to room:", data.chatId);
      this.io.to(data.chatId).emit("chat-message", data);
    });

    
    await subscriber.pSubscribe("notifications:*", (message, channel) => {
      const data = JSON.parse(message);
      logger.debug("Broadcasting notification from channel:", channel);
      this.io.to(data.chatId).emit("notification", data);
    });

    this.isSubscribed = true;
  }
}
