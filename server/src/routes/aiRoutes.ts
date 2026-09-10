import { Router } from 'express';
import { recommendFood, getPersonalizedRecommendations, chatWithAI } from '../controllers/aiController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/recommend', recommendFood);
router.post('/chat', optionalAuth, chatWithAI);
router.get('/personalized', optionalAuth, getPersonalizedRecommendations);

export default router;
