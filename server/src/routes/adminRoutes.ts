import { Router } from 'express';
import {
  getDashboardStats,
  getAnalytics,
  exportOrdersCSV,
  exportSalesCSV,
  exportInventoryCSV,
  getAllUsers,
  toggleUserStatus,
  regenerateFoodItemImage,
} from '../controllers/adminController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';

const router = Router();

router.use(protect, isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/export/orders', exportOrdersCSV);
router.get('/export/sales', exportSalesCSV);
router.get('/export/inventory', exportInventoryCSV);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.post('/food/:id/regenerate-image', regenerateFoodItemImage);

export default router;
