import { Request, Response } from 'express';
import { FoodItem } from '../models/FoodItem';
import { AuthRequest } from '../middleware/auth';
import { paginate } from '../utils/helpers';

export const getFoodItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      canteen,
      category,
      vegetarian,
      jain,
      minPrice,
      maxPrice,
      spicyLevel,
      available,
      search,
      sort = 'popularityScore',
      page = '1',
      limit = '20',
    } = req.query;

    const filter: Record<string, unknown> = { isActive: true };

    if (canteen) filter.canteen = canteen;
    if (category) filter.category = category;
    if (vegetarian === 'true') filter.vegetarian = true;
    if (jain === 'true') filter.jainAvailable = true;
    if (available === 'true') filter.available = true;
    if (spicyLevel) filter.spicyLevel = spicyLevel;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }

    const { skip, limit: lim } = paginate(Number(page), Number(limit));

    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { rating: -1 }; break;
      case 'prep_time': sortOption = { preparationTime: 1 }; break;
      case 'name': sortOption = { name: 1 }; break;
      default: sortOption = { popularityScore: -1 };
    }

    let query;
    if (search) {
      query = FoodItem.find({
        ...filter,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      });
    } else {
      query = FoodItem.find(filter);
    }

    const total = await FoodItem.countDocuments(
      search
        ? {
            ...filter,
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { tags: { $regex: search, $options: 'i' } },
            ],
          }
        : filter
    );

    const items = await query
      .populate('category', 'name slug icon')
      .populate('canteen', 'name slug floor')
      .sort(sortOption)
      .skip(skip)
      .limit(lim)
      .lean();

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page: Number(page),
        limit: lim,
        pages: Math.ceil(total / lim),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFoodItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await FoodItem.findById(req.params.id)
      .populate('category', 'name slug icon')
      .populate('canteen', 'name slug floor isOpen')
      .lean();

    if (!item) {
      res.status(404).json({ success: false, message: 'Food item not found.' });
      return;
    }

    res.status(200).json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createFoodItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await FoodItem.create(req.body);
    const populated = await item.populate(['category', 'canteen']);
    res.status(201).json({ success: true, data: populated });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateFoodItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category canteen');

    if (!item) {
      res.status(404).json({ success: false, message: 'Food item not found.' });
      return;
    }

    res.status(200).json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteFoodItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await FoodItem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) {
      res.status(404).json({ success: false, message: 'Food item not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Food item deactivated.' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stock, available } = req.body;
    const updateData: Record<string, unknown> = {};
    if (typeof stock === 'number') updateData.stock = stock;
    if (typeof available === 'boolean') updateData.available = available;
    if (stock === 0) updateData.available = false;

    const item = await FoodItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!item) {
      res.status(404).json({ success: false, message: 'Food item not found.' });
      return;
    }
    res.status(200).json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPopularItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { canteenId, limit = '10' } = req.query;
    const filter: Record<string, unknown> = { isActive: true, available: true };
    if (canteenId) filter.canteen = canteenId;

    const items = await FoodItem.find(filter)
      .populate('category', 'name')
      .populate('canteen', 'name slug')
      .sort({ popularityScore: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({ success: true, data: items });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
