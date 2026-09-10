import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, preferences } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      preferences: preferences || { vegetarian: false, jain: false, spiceLevel: 'medium' },
      role: 'student',
    });

    const token = generateToken((user._id as string).toString());

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          preferences: user.preferences,
          totalOrders: user.totalOrders,
          totalSpent: user.totalSpent,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account is deactivated. Contact support.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken((user._id as string).toString());

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          preferences: user.preferences,
          totalOrders: user.totalOrders,
          totalSpent: user.totalSpent,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).populate('favoriteCanteen', 'name slug').lean();
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userData = { ...user };
    res.status(200).json({ success: true, data: userData, user: userData });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, avatar, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, phone, avatar, preferences },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Profile updated.', data: user, user });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
