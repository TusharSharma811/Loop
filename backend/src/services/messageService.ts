import prisma from '../lib/prismaClient.js';
import cloudinaryClient from '../lib/cloudinaryClient.js';
import logger from '../utils/logger.js';

export type MessageType = 'text' | 'image' | 'file';

interface SaveMessageParams {
  chatId: string;
  senderId: string;
  content: string;
  messageType: MessageType | string;
}

// Extracted message persistence logic for reuse.
// Behavior remains identical to previous inline implementation.
export async function saveMessage({ chatId, senderId, content, messageType }: SaveMessageParams) {
  try {
    if (messageType === 'image') {
      const fileData = JSON.parse(content);
      const uploadResult = await cloudinaryClient.uploader.upload(fileData.content, {
        folder: 'chat_images',
        resource_type: 'auto',
      });
      const contentToStore = uploadResult.secure_url;

      const newMessage = await prisma.message.create({
        data: {
          chatId,
          senderId,
          content: contentToStore,
          messageType: messageType as string,
          timeStamp: new Date(),
        },
      });
      return newMessage;
    } else {
      const newMessage = await prisma.message.create({
        data: {
          chatId,
          senderId,
          content,
          timeStamp: new Date(),
          messageType: messageType as string,
        },
      });
      return newMessage;
    }
  } catch (error) {
    logger.error('Error saving message:', error);
    throw error;
  }
}

export default { saveMessage };
