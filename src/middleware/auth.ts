import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

interface JwtPayload {
  id: string;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    console.log('Received token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    console.log('Decoded token:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export default authMiddleware;