import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateJWT = (userId: any): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '12m' });
}

export const generateRefreshJWT = (userId: any): string => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
}