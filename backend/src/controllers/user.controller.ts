import { Request, Response } from "express";
import prisma from "../lib/prismaClient.js";
import dotenv from "dotenv";
dotenv.config();



class userController {
    // 🟢 ME
     async me(req: Request, res: Response) {
        try {
          const userId = (req as any).user.userId;
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, username: true, fullname: true },
          });
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          return res.status(200).json({ user });
        } catch (error) {
          console.error("Error fetching user", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
    

    // Update user details

    async updateUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { fullname, bio } = req.body;
            const user = await prisma.user.update({
                where: { id: userId },
                data: { fullname, bio },
            });
            return res.status(200).json({ user });
        } catch (error) {
            console.error("Error updating user", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            await prisma.user.delete({ where: { id: userId } });
            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    
}


export default new userController();