
import type { Response } from "express";
import prisma from "../lib/prismaClient.js";
import type { RequestWithUser } from "../middlewares/protectRoutes.ts";
import logger from "../utils/logger.js";

class MessageController {
  /**
   * Get messages with pagination (20 at a time)
   */
   getMessages = async (req: RequestWithUser, res: Response) => {
    try {
      const { chatId } = req.params;
      const userId = req.user?.userId;
      const { cursor } = req.query; // optional: messageId of last message
      const pageSize = 20;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!chatId) return res.status(400).json({ error: "Chat ID is required" });

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { participants: true },
      });
      if (!chat) return res.status(404).json({ error: "Chat not found" });
      if (!this.isUserParticipant(chat.participants, userId)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "desc" }, 
        take: pageSize + 1, // fetch one extra to check if there's more
        ...(cursor
          ? {
              skip: 1, // skip the cursor itself
              cursor: { id: cursor as string },
            }
          : {}),
      });

      // 3. Figure out next cursor
      let nextCursor: string | null = null;
      if (messages.length > pageSize) {
        const nextItem = messages.pop(); // remove extra item
        nextCursor = nextItem?.id || null;
      }

     
      return res.status(200).json({
        messages: messages.reverse(),
        nextCursor,
      });
    } catch (error) {
      logger.error("Error getting messages:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  private isUserParticipant = async (
    participants: { userId: string }[],
    userId: string
  ): Promise<boolean> => {
    return participants.some((p) => p.userId === userId);
  }
}

export default new MessageController();
