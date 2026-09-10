import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Favorite } from '../models/Favorite';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await Favorite.find({ user: req.user?._id })
      .populate({
        path: 'foodItem',
        populate: [
          { path: 'canteen', select: 'name slug floor' },
          { path: 'category', select: 'name icon' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: favorites });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { foodItemId } = req.body;
    const existing = await Favorite.findOne({ user: req.user?._id, foodItem: foodItemId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      res.status(200).json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await Favorite.create({ user: req.user?._id, foodItem: foodItemId });
      res.status(201).json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({ success: false, message: err.message });
  }
};
