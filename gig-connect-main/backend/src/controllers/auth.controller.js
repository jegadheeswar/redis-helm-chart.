// backend/src/controllers/auth.controller.js
import User from '../models/User.js';
import { generateTokens } from '../utils/jwt.js';
import { z } from 'zod';

// Define Zod schemas for validation
// Updated to accept phone numbers with +91 prefix followed by 10 digits
const phoneSchema = z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number (must be +91 followed by 10 digits starting with 6,7,8, or 9)');

const registerSchema = z.object({
  phone: phoneSchema, // Expects +91 prefix
  name: z.string().min(2).max(50),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Path of error
});

const loginSchema = z.object({
  phone: phoneSchema, // Expects +91 prefix
  password: z.string().min(6), // Add password to login schema
});

// Register: Create user with phone, name, password (hashed automatically by pre-save hook)
export const register = async (req, res) => {
  try {
    const { phone, name, password } = registerSchema.parse(req.body); // phone should be +91XXXXXXXXXX

    // Check if user already exists
    const existingUser = await User.findOne({ phone }); // Use the full phone number including +91
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user (password will be hashed by the pre-save hook in the User model)
    const user = new User({
      phone, // Store the full phone number including +91
      name,
      password, // Will be hashed before saving
      role: 'USER',
    });

    await user.save();

    // Generate tokens for the newly created user
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        rating: {
          avg: user.ratingAvg,
          count: user.ratingCount,
        },
        completedJobs: user.completedJobs,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[AUTH REGISTER ZOD ERROR]', error.errors); // Log Zod validation errors
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('[AUTH REGISTER ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login: Find user by phone, compare password, issue tokens
export const login = async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body); // phone should be +91XXXXXXXXXX

    // Find user by the full phone number including +91
    const user = await User.findOne({ phone });
    if (!user) {
      // To prevent user enumeration, use a generic message
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password stored in the database
    // The comparePassword method was added to the User model
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens for the authenticated user
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role,
    });

    res.json({
      message: 'Login successful!',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        rating: {
          avg: user.ratingAvg,
          count: user.ratingCount,
        },
        completedJobs: user.completedJobs,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[AUTH LOGIN ZOD ERROR]', error.errors); // Log Zod validation errors
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('[AUTH LOGIN ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};