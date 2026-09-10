import { Router } from 'express';
import { createReview, getReviewsByFoodItem, moderateReview, getAllReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';

const router = Router();

router.get('/all', protect, isAdmin, getAllReviews);
router.get('/food/:foodId', getReviewsByFoodItem);
router.post('/', protect, createReview);
router.patch('/:id/moderate', protect, isAdmin, moderateReview);

export default router;
