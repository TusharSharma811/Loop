import { log } from 'console';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export interface RequestWithUser extends Request {
    user?: { userId: string };
}

export const protectRoutes  = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try{
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(500).json({ message: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.user  = decoded;
    next();
} catch (error) {
    console.error("Error protecting routes", error);
    if (error instanceof Error && error.name === "TokenExpiredError") {

      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
}
}