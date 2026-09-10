import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { FoodItem } from '../models/FoodItem';
import { Order } from '../models/Order';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { foodItemId, orderId, rating, comment } = req.body;

    // Verify user actually ordered this item
    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'You can only review items you ordered.' });
      return;
    }

    const hasItem = order.items.some((item) => item.foodItem.toString() === foodItemId);
    if (!hasItem) {
      res.status(403).json({ success: false, message: 'This item was not in your order.' });
      return;
    }

    if (order.orderStatus !== 'completed') {
      res.status(400).json({ success: false, message: 'You can only review completed orders.' });
      return;
    }

    const existingReview = await Review.findOne({ user: req.user._id, foodItem: foodItemId });
    if (existingReview) {
      res.status(400).json({ success: false, message: 'You have already reviewed this item.' });
      return;
    }

    const review = await Review.create({
      user: req.user._id,
      foodItem: foodItemId,
      order: orderId,
      rating,
      comment,
    });

    // Update food item rating
    const reviews = await Review.find({ foodItem: foodItemId, approved: true });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : rating;

    await FoodItem.findByIdAndUpdate(foodItemId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    const populated = await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getReviewsByFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const foodObjectId = mongoose.Types.ObjectId.isValid(req.params.foodId)
      ? new mongoose.Types.ObjectId(req.params.foodId)
      : null;

    const reviews = await Review.find({ foodItem: req.params.foodId, approved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const stats = foodObjectId ? await Review.aggregate([
      { $match: { foodItem: foodObjectId, approved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDist: { $push: '$rating' },
        },
      },
    ]) : [];

    res.status(200).json({ success: true, data: reviews, stats: stats[0] || {} });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const moderateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { approved } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { approved }, { new: true });
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    // Recalculate rating
    const reviews = await Review.find({ foodItem: review.foodItem, approved: true });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await FoodItem.findByIdAndUpdate(review.foodItem, {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('foodItem', 'name canteen image price')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: reviews });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

