import { log } from 'console';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface RequestWithUser extends Request {
    user?: { userId: string };
}

export const protectRoutes  = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try{

    console.log("Protecting routes middleware cookie" , Object.keys(req.cookies));
    const token = req.cookies.token;

    console.log("Token in protectRoutes:", token);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    req.user  = decoded;
    next();
} catch (error) {
    console.error("Error protecting routes", error);
    return res.status(500).json({ message: 'Internal server error' });
}
}