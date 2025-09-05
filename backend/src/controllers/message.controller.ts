import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient.ts';


export const getMessages = async (req: Request, res: Response) => {
    try {
        const chatId = Number(req.params.chatId);
        if (isNaN(chatId)) {
            return res.status(400).json({ message: 'Invalid chatId' });
        }
        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' }
        });

        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: 'Messages not found' });
        }
        return res.status(200).json({ messages });
    } catch (error) {
        console.error("Error getting messages", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} ;
export const deleteMessage = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        
    }
} ;