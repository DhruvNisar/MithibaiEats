import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read', markAsRead);

export default router;
