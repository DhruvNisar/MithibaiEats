import { Request, Response } from 'express';
import { Canteen } from '../models/Canteen';
import { FoodItem } from '../models/FoodItem';
import { AuthRequest } from '../middleware/auth';

export const getCanteens = async (_req: Request, res: Response): Promise<void> => {
  try {
    const canteens = await Canteen.find().lean();

    // Attach item counts
    const canteensWithCounts = await Promise.all(
      canteens.map(async (canteen) => {
        const itemCount = await FoodItem.countDocuments({ canteen: canteen._id, isActive: true });
        return { ...canteen, totalItems: itemCount };
      })
    );

    res.status(200).json({ success: true, data: canteensWithCounts });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCanteenById = async (req: Request, res: Response): Promise<void> => {
  try {
    const canteen = await Canteen.findById(req.params.id).lean();
    if (!canteen) {
      res.status(404).json({ success: false, message: 'Canteen not found.' });
      return;
    }
    const itemCount = await FoodItem.countDocuments({ canteen: canteen._id, isActive: true });
    res.status(200).json({ success: true, data: { ...canteen, totalItems: itemCount } });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCanteenBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const canteen = await Canteen.findOne({ slug: req.params.slug }).lean();
    if (!canteen) {
      res.status(404).json({ success: false, message: 'Canteen not found.' });
      return;
    }
    res.status(200).json({ success: true, data: canteen });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCanteen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!canteen) {
      res.status(404).json({ success: false, message: 'Canteen not found.' });
      return;
    }
    res.status(200).json({ success: true, data: canteen });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
