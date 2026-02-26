import type { Request, Response } from "express";
import prisma from "../lib/prismaClient.js";
import type { RequestWithUser } from "../middlewares/protectRoutes.ts";
import logger from "../utils/logger.js";

class ChatController {
  getChatsofUser = async (req: RequestWithUser, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const userId = req.user.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const chats = await prisma.chat.findMany({
        where: {
          participants: { some: { userId } },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullname: true,
                  avatarUrl: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              timeStamp: true,

              sender: { select: { id: true, username: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      const formatted = chats.map((chat) => ({
        id: chat.id,
        isGroup: chat.isGroup,
        name: chat.name,
        participants: chat.participants.map((p) => p.user),
        lastMessage: chat.messages[0] || null,
      }));

      return res.status(200).json(formatted);
    } catch (error) {
      logger.error("Error fetching user chats:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getUsersByUsernameOrFullname = async (
    req: RequestWithUser,
    res: Response
  ) => {
    const { query } = req;
    const searchTerm = query.q as string;
    const userId = req.user?.userId;
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm, mode: "insensitive" } },
            { fullname: { contains: searchTerm, mode: "insensitive" } },
          ],
          id: { not: userId },
        },
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          avatarUrl: true,
          bio: true,
        },
      });
      res.status(200).json(users);
    } catch (error) {
      logger.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  createChat = async (req: RequestWithUser, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { participantIds, isGroup = false, groupName = "" } = req.body;

      if (
        !participantIds ||
        !Array.isArray(participantIds) ||
        participantIds.length === 0
      ) {
        logger.warn("Invalid participant IDs:", participantIds);

        return res
          .status(400)
          .json({ error: "At least one participant ID is required" });
      }

      if (isGroup && (!groupName || groupName.trim() === "")) {
        logger.warn("Missing group name for group chat");
        return res
          .status(400)
          .json({ error: "Group name is required for group chats" });
      }

      // Ensure the current user is included in participants
      if (!participantIds.includes(userId)) {
        participantIds.push(userId);
      }
      const uniqueParticipantIds = Array.from(new Set(participantIds));

      // For non-group chats, ensure exactly two participants
      if (!isGroup && uniqueParticipantIds.length !== 2) {
        return res.status(400).json({
          error: "One-on-one chats must have exactly two participants",
        });
      }
      // MongoDB (via Prisma) doesn't support `every` filter on relations. Replace with two `some` filters
      // and validate participant count in code to ensure it's exactly those two users.
      let checkChat = null as any;
      if (!isGroup && uniqueParticipantIds.length === 2) {
        const [u1, u2] = uniqueParticipantIds;
        checkChat = await prisma.chat.findFirst({
          where: {
            isGroup: false,
            AND: [
              { participants: { some: { userId: u1 } } },
              { participants: { some: { userId: u2 } } },
            ],
          },
          include: { participants: true },
        });
        if (checkChat && checkChat.participants.length === 2) {
          return res.status(200).json(checkChat);
        }
      }
      const newChat = await prisma.chat.create({
        data: {
          isGroup: Boolean(isGroup),
          name: isGroup ? groupName : null,
          participants: {
            create: uniqueParticipantIds.map((id: string) => ({
              user: { connect: { id } },
              role: id === userId ? "admin" : "member",
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: { select: { id: true, username: true, fullname: true } },
            },
          },
          messages: { select: { id: true, content: true, createdAt: true, senderId: true } },
        },
      });
      const formatted = {
        id: newChat.id,
        isGroup: newChat.isGroup,
        name: newChat.name,
        participants: newChat.participants.map((p) => p.user),
        lastMessage: newChat.messages[0] || null,
      };
      res.status(201).json(formatted);
    } catch (error) {
      logger.error("Error creating chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  getChatById = async (req: RequestWithUser, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const chatId : any= req.params.id;
      if (!chatId) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }

      const chat : any = await prisma.chat.findFirst({
        where: {
          id: chatId,
          participants: {
            some: { userId }, // ✅ Check membership via ChatParticipant
          },
        },
        include: {
          participants: {
            include: {
              user: { select: { id: true, username: true, fullname: true } },
            },
          },
        },
      });

      if (!chat) {
        return res
          .status(404)
          .json({ error: "Chat not found or access denied" });
      }

      res.status(200).json(chat);
    } catch (error) {
      logger.error("Error fetching chat by ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteChat = async (req: RequestWithUser, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const chatId : any= req.params.chatId;
      if (!chatId) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          participants: { some: { userId } },
        },
      });
      if (!chat) {
        return res
          .status(404)
          .json({ error: "Chat not found or access denied" });
      }
      // Emulate cascade deletes (Mongo doesn't enforce referential actions)
      // 1) Delete message statuses for messages in this chat
      const msgs = await prisma.message.findMany({
        where: { chatId },
        select: { id: true },
      });
      const msgIds = msgs.map((m) => m.id);
      if (msgIds.length > 0) {
        await prisma.messageStatus.deleteMany({ where: { messageId: { in: msgIds } } });
      }
      // 2) Delete messages and participants
      await prisma.message.deleteMany({ where: { chatId } });
      await prisma.chatParticipant.deleteMany({ where: { chatId } });
      // 3) Delete the chat document
      await prisma.chat.delete({ where: { id: chatId } });
      res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
      logger.error("Error deleting chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export default new ChatController();
