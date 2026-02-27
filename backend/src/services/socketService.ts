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

interface TypingPayload {
  chatId: string;
  userId: string;
  username: string;
}

export class SocketIo {
  private io: Server;
  private isSubscribed = false;
  private userSocketMap = new Map<string, Set<string>>();

  constructor(io: Server) {
    this.io = io;
  }

  async init() {
    this.io.on("connection", async (socket: Socket) => {
      logger.info("Client connected:", socket.id);
      const userId = socket.handshake.query.userId as string;

      if (userId) {
        if (!this.userSocketMap.has(userId)) {
          this.userSocketMap.set(userId, new Set());
        }
        this.userSocketMap.get(userId)!.add(socket.id);
      }

      this.registerEventHandlers(socket, userId);

      const chats = await prisma.chat.findMany({
        where: { participants: { some: { userId } } },
        select: { id: true },
      });

      chats.forEach((chat) => {
        socket.join(chat.id);
        socket.to(chat.id).emit("online-user", userId);
      });
    });

    await this.setupRedisSubscriptions();
  }

  private registerEventHandlers(socket: Socket, userId: string) {
    socket.on("joinRoom", (roomId: string) => this.handleJoinRoom(socket, roomId));
    socket.on("leaveRoom", (roomId: string) => this.handleLeaveRoom(socket, roomId));
    socket.on("NewMessage", (msg: MessagePayload, type?: string) => this.handleNewMessage(socket, msg, type));
    socket.on("typing", (data: TypingPayload) => this.handleTyping(socket, data));
    socket.on("disconnect", () => this.handleDisconnect(socket, userId));
  }

  private handleJoinRoom(socket: Socket, roomId: string) {
    socket.join(roomId);
  }

  private handleLeaveRoom(socket: Socket, roomId: string) {
    socket.leave(roomId);
  }

  private handleTyping(socket: Socket, data: TypingPayload) {
    if (!data.chatId || !data.userId) return;
    socket.to(data.chatId).emit("user-typing", {
      userId: data.userId,
      chatId: data.chatId,
      username: data.username,
    });
  }

  private async handleNewMessage(socket: Socket, message: MessagePayload, messageType?: string) {
    if (!message.content || !message.chatId || !message.senderId) {
      logger.warn("Invalid message data:", message);
      return;
    }

    try {
      const newMessage = await saveMessage({
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType || messageType || 'text',
      });

      const payload = JSON.stringify({
        message: newMessage,
        chatId: message.chatId,
        userId: message.senderId,
      });

      await publisher.publish("chat", payload);
      await publisher.publish(`notifications:${message.chatId}`, payload);
    } catch (error) {
      logger.error("Error saving message:", error);
    }
  }

  private handleDisconnect(socket: Socket, userId: string) {
    logger.debug("Client disconnected:", socket.id);

    if (userId && this.userSocketMap.has(userId)) {
      const sockets = this.userSocketMap.get(userId)!;
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        this.userSocketMap.delete(userId);
        this.io.emit("user-offline", userId);
      }
    }
  }

  private async setupRedisSubscriptions() {
    if (this.isSubscribed) return;

    await subscriber.subscribe("chat", (message) => {
      const data = JSON.parse(message);
      this.io.to(data.chatId).emit("chat-message", data);
    });

    await subscriber.pSubscribe("notifications:*", (message, _channel) => {
      const data = JSON.parse(message);
      this.io.to(data.chatId).emit("notification", data);
    });

    this.isSubscribed = true;
  }
}
