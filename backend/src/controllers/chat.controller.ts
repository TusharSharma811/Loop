import type { Request, Response } from "express";
import prisma from "../lib/prismaClient.js";
import type { RequestWithUser } from "../middlewares/protectRoutes.ts";

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
      console.error("Error fetching user chats:", error);
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
        },
      });
      const usersWithoutPassword = users.filter((u) => {
        if (u.id === userId) return false;
        u.passwordHash = "";
        return true;
      });
      res.status(200).json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
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
        console.log("Participant IDs:", participantIds);

        return res
          .status(400)
          .json({ error: "At least one participant ID is required" });
      }

      if (isGroup && (!groupName || groupName.trim() === "")) {
        console.log("Group name:", groupName);
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
      const checkChat = await prisma.chat.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: uniqueParticipantIds,
              },
            },
          },
        },
      });
      if (checkChat) {
        return res.status(200).json(checkChat);
      }
      const newChat = await prisma.chat.create({
        data: {
          isGroup: Boolean(isGroup),
          name: isGroup ? groupName : null,
          participants: {
            create: participantIds.map((id: string) => ({
              user: { connect: { id } }, // ✅ Connect user via ChatParticipant
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
      console.error("Error creating chat:", error);
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
      console.error("Error fetching chat by ID:", error);
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
      await prisma.chat.delete({ where: { id: chatId } });
      res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export default new ChatController();
