import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    try {
      // Get token from cookie
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (payload has user id) and attach to request
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
      
      next(); // Move to the next middleware/controller
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' }); [cite: 13, 27]
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' }); [cite: 13, 27]
  }
};