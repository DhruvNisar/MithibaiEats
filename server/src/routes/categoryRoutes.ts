import { Router } from 'express';
import { getCategories, createCategory, updateCategory } from '../controllers/categoryController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, isAdmin, createCategory);
router.put('/:id', protect, isAdmin, updateCategory);

export default router;
