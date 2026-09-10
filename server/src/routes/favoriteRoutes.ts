import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoriteController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

export default router;
