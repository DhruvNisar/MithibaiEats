import { Router } from 'express';
import { getCanteens, getCanteenById, getCanteenBySlug, updateCanteen } from '../controllers/canteenController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', getCanteens);
router.get('/slug/:slug', getCanteenBySlug);
router.get('/:id', getCanteenById);
router.put('/:id', protect, isAdmin, updateCanteen);

export default router;
