import type {Request , Response} from "express";
import prisma from "../lib/prismaClient.ts";
import type { RequestWithUser } from "../middlewares/protectRoutes.ts";
export const getChatsofUser = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = Number(req.user.userId);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const chats = await prisma.chat.findMany({
      where: {
        participants: { some: { userId } }
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, fullname: true } }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: { select: { id: true, username: true } }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const formatted = chats.map(chat => ({
      id: chat.id,
      isGroup: chat.isGroup,
      name: chat.name,
      participants: chat.participants.map(p => p.user),
      lastMessage: chat.messages[0] || null
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersByUsernameOrFullname = async (req: Request, res: Response) => {
  const { query } = req;
  const searchTerm = query.q as string;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { fullname: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChat = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = Number(req.user.userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { participantIds, isGroup = false, groupName = "" } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      console.log("Participant IDs:", participantIds);
      
      return res.status(400).json({ error: "At least one participant ID is required" });
    }

    if (isGroup && (!groupName || groupName.trim() === "")) {
      console.log("Group name:", groupName);
      return res.status(400).json({ error: "Group name is required for group chats" });
    }

    // Ensure the current user is included in participants
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    const newChat = await prisma.chat.create({
      data: {
        isGroup: Boolean(isGroup),
        name: isGroup ? groupName : null,
        participants: {
          create: participantIds.map((id: number) => ({
            user: { connect: { id } }, // ✅ Connect user via ChatParticipant
            role: id === userId ? "admin" : "member"
          }))
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, fullname: true } } }
        }
      }
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getChatById = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = Number(req.user.userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chatId = Number(req.params.id);
    if (isNaN(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: { userId } // ✅ Check membership via ChatParticipant
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, fullname: true } } }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found or access denied" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
