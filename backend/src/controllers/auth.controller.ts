import type { Request, Response } from "express";
import prisma from "../lib/prismaClient.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const userPayload = { id: user.id, email: user.email };
    const accesstoken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET as string
    );
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
    return res.status(200).json({ message: "Login successful", user: userPayload });
  } catch (error) {
    console.error("Error logging in", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const register = async (req: Request, res: Response) => {
  // Handle registration logic
  try {
    const { username, email, fullname, password, avatar } = req.body;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        fullname,
        email,
        passwordHash: hashedPassword,
      },
    });
    const accesstoken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET as string
    );
    res.cookie("token", accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ message: "User created successfully", user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    console.error("Error registering", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  // Handle logout logic
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = (req: Request, res: Response) => {
  // Handle token refresh logic
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { userId: string };
    const accesstoken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET as string
    );
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
    return res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing token", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const googleLogin = (req: Request, res: Response) => {
  // Handle Google login logic
};
export const googleLoginCallback = (req: Request, res: Response) => {
  // Handle Google login callback logic
};

export const verify = (req: Request, res: Response) => {
  return res.status(200).json({ valid: true });
};

export const me = async (req: Request, res: Response) => {
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
};