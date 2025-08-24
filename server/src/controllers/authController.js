import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt); [cite: 25]

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    if (user) {
      const token = generateToken(user.id);
      res.cookie('token', token, {
        httpOnly: true, // Crucial for security 
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      res.status(201).json({ id: user.id, email: user.email }); // 201 Created [cite: 26]
    }
  } catch (error) {
    res.status(400).json({ message: 'User already exists or invalid data' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    // ... (logic to find user by email and compare password with bcrypt)
    // On success:
    const token = generateToken(user.id);
    res.cookie('token', token, { httpOnly: true, ... }); // Set the cookie
    res.status(200).json({ id: user.id, email: user.email }); // 200 OK [cite: 26]
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Expire the cookie immediately
    });
    res.status(200).json({ message: 'Logged out successfully' });
};