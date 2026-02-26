import { StreamClient } from "@stream-io/node-sdk";
import { Response } from "express";
import { RequestWithUser } from "../middlewares/protectRoutes.js";
import logger from "../utils/logger.js";

// Create StreamClient once at module level instead of per-request
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
let streamClient: StreamClient | null = null;

function getStreamClient(): StreamClient {
  if (!streamClient) {
    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set");
    }
    streamClient = new StreamClient(apiKey, apiSecret);
  }
  return streamClient;
}

export const getToken = async (req: RequestWithUser, res: Response) => {
  try {
    const client = getStreamClient();
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const token = client.generateUserToken({ user_id: userId });
    res.json({ token, apiKey });
  } catch (error) {
    logger.error("Error generating token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
