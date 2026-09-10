import { Router } from 'express';
import { getQRCodes, generateCanteenQRCodes, recordScan } from '../controllers/qrController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';

const router = Router();

router.get('/', getQRCodes);
router.post('/generate-canteens', protect, isAdmin, generateCanteenQRCodes);
router.post('/:id/scan', recordScan);

export default router;
