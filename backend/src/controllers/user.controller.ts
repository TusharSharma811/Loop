import { Response } from "express";
import prisma from "../lib/prismaClient.js";
import type { RequestWithUser } from "../middlewares/protectRoutes.js";
import logger from "../utils/logger.js";

class UserController {
  // 🟢 ME
  async me(req: RequestWithUser, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, username: true, fullname: true, avatarUrl: true, bio: true },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ user });
    } catch (error) {
      logger.error("Error fetching user", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Update user details
  async updateUser(req: RequestWithUser, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { fullname, bio } = req.body;
      const user = await prisma.user.update({
        where: { id: userId },
        data: { fullname, bio },
        select: { id: true, email: true, username: true, fullname: true, avatarUrl: true, bio: true },
      });
      return res.status(200).json({ user });
    } catch (error) {
      logger.error("Error updating user", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteUser(req: RequestWithUser, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      await prisma.user.delete({ where: { id: userId } });
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      logger.error("Error deleting user", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new UserController();