import { Request, Response } from 'express';
import { getAIRecommendations, chatWithAIAssistant } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { FoodItem } from '../models/FoodItem';

export const recommendFood = async (req: Request, res: Response): Promise<void> => {
  try {
    const { budget, canteenId, canteenSlug, vegetarian, jain, spiceLevel, maxPrepTime, craving, category, query } = req.body;

    const results = await getAIRecommendations({
      budget: budget !== undefined ? Number(budget) : undefined,
      canteenId,
      canteenSlug,
      vegetarian: vegetarian !== undefined ? (vegetarian === true || vegetarian === 'true') : undefined,
      jain: jain !== undefined ? (jain === true || jain === 'true') : undefined,
      spiceLevel,
      maxPrepTime: maxPrepTime !== undefined ? Number(maxPrepTime) : undefined,
      craving,
      category,
      query,
    });

    res.status(200).json({
      success: true,
      data: results.recommendations,
      summary: results.summary,
      totalMatches: results.totalMatches,
      parsedCriteria: results.parsedCriteria,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const chatWithAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, currentCanteenSlug, currentCanteenId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message string is required.' });
      return;
    }

    const result = await chatWithAIAssistant({
      message,
      currentCanteenSlug,
      currentCanteenId,
      userPreferences: req.user?.preferences,
    });

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        recommendations: result.recommendations,
        parsedCriteria: result.parsedCriteria,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    // 1. Personalized list
    const personalizedQuery: Record<string, any> = { isActive: true, available: true };
    if (user?.preferences?.jain) {
      personalizedQuery.jainAvailable = true;
    } else if (user?.preferences?.vegetarian) {
      personalizedQuery.vegetarian = true;
    }

    if (user?.favoriteCanteen) {
      personalizedQuery.canteen = user.favoriteCanteen;
    }

    const personalized = await FoodItem.find(personalizedQuery)
      .populate('category', 'name icon slug')
      .populate('canteen', 'name slug floor')
      .sort({ rating: -1, popularityScore: -1 })
      .limit(8)
      .lean();

    // 2. Quick Bites (ready in <= 10 mins)
    const quickBitesQuery: Record<string, any> = {
      isActive: true,
      available: true,
      preparationTime: { $lte: 10 },
    };
    if (user?.preferences?.jain) {
      quickBitesQuery.jainAvailable = true;
    }

    const quickBites = await FoodItem.find(quickBitesQuery)
      .populate('category', 'name icon slug')
      .populate('canteen', 'name slug floor')
      .sort({ preparationTime: 1, popularityScore: -1 })
      .limit(8)
      .lean();

    // 3. Trending items
    const trending = await FoodItem.find({ isActive: true, available: true })
      .populate('category', 'name icon slug')
      .populate('canteen', 'name slug floor')
      .sort({ popularityScore: -1, rating: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        personalized,
        quickBites,
        trending,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
