import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  reorder,
} from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';
import { orderLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(protect);

router.post('/', orderLimiter, createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', isAdmin, updateOrderStatus);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/reorder', reorder);

export default router;
