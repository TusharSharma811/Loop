import { StreamClient } from "@stream-io/node-sdk";
import { Request, Response } from "express";
import { RequestWithUser } from "../middlewares/protectRoutes";
import dotenv from "dotenv";
dotenv.config();
export const getToken = async (req: RequestWithUser, res: Response) => {
  try {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    const client = new StreamClient(apiKey as string, apiSecret as string);
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const token = client.generateUserToken({ user_id: userId });

    res.json({ token, apiKey });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
