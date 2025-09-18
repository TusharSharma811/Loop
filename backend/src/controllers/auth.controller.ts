import type { Request, Response } from "express";
import prisma from "../lib/prismaClient.ts";
import bcrypt from "bcryptjs";
import { generateJWT, generateRefreshJWT } from "../utils/generateJWT.ts";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class AuthController {

   private setAuthCookies = (res: Response, accesstoken: string, refreshToken: string) => {
    res.cookie("token", accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  // 🟢 LOGIN
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accesstoken = generateJWT(user.id);
      const refreshToken = generateRefreshJWT(user.id);

      this.setAuthCookies(res, accesstoken, refreshToken);

      return res.status(200).json({
        message: "Login successful",
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error("Error logging in", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 REGISTER
  register = async (req: Request, res: Response) => {
    try {
      const { username, email, fullname, password } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, fullname, email, passwordHash: hashedPassword },
      });

      const accesstoken = generateJWT(user.id);
      const refreshToken = generateRefreshJWT(user.id);

      this.setAuthCookies(res, accesstoken, refreshToken);

      return res.status(201).json({
        message: "User created successfully",
        user: { id: user.id, email: user.email, username: user.username },
      });
    } catch (error) {
      console.error("Error registering", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 LOGOUT
  logout = (req: Request, res: Response) => {
    try {
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error logging out", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 REFRESH TOKEN
  refreshToken = (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as { userId: string };

      const accesstoken = generateJWT(decoded.userId);
      const refreshTokenNew = generateRefreshJWT(decoded.userId);

      this.setAuthCookies(res, accesstoken, refreshTokenNew);

      return res
        .status(200)
        .json({ message: "Token refreshed successfully", valid: true });
    } catch (error) {
      console.error("Error refreshing token", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 GOOGLE LOGIN (placeholder)
  googleLogin = (req: Request, res: Response) => {
    // TODO: Implement Google OAuth login
    return res.status(501).json({ message: "Not implemented" });
  }

  googleLoginCallback = (req: Request, res: Response) => {
    // TODO: Handle Google OAuth callback
    return res.status(501).json({ message: "Not implemented" });
  }

  // 🟢 VERIFY
  verify = (req: Request, res: Response) => {
    return res.status(200).json({ valid: true });
  }

  

  // 🔒 UTILITY to set auth cookies
 
}

export default new AuthController();
