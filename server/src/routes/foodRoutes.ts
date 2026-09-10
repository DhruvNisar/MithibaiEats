import { Router } from 'express';
import {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  updateStock,
  getPopularItems,
} from '../controllers/foodController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', getFoodItems);
router.get('/popular', getPopularItems);
router.get('/:id', getFoodItemById);

router.post('/', protect, isAdmin, createFoodItem);
router.put('/:id', protect, isAdmin, updateFoodItem);
router.delete('/:id', protect, isAdmin, deleteFoodItem);
router.patch('/:id/stock', protect, isAdmin, updateStock);

export default router;
