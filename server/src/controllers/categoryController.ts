import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, icon, sortOrder } = req.body;
    const category = await Category.create({ name, slug, icon, sortOrder });
    res.status(201).json({ success: true, data: category });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    res.status(200).json({ success: true, data: category });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({ success: false, message: err.message });
  }
};
