import type { Request, Response } from "express";
import prisma from "../lib/prismaClient.ts";
import type { RequestWithUser } from "../middlewares/protectRoutes.ts";

export const getMessages = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("Fetching messages for chatId:", req.params.chatId);
    
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const chatId = req.params.chatId;
    if (!chatId) return res.status(400).json({ error: "Chat ID is required" });
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: true },
    });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) return res.status(403).json({ error: "Forbidden" });
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
    if (!messages || messages.length === 0) {
      return res.status(404).json({ error: "Messages not found" });
    }
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting messages", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
