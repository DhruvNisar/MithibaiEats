import { Router } from 'express';
import {
  createPayment,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  getPaymentByOrder,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = Router();

// Public webhook route
router.post('/razorpay/webhook', handleRazorpayWebhook);

// Protected payment routes
router.use(protect);

router.get('/razorpay/key', getRazorpayKey);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

router.post('/create', createPayment);
router.post('/simulate/success', simulatePaymentSuccess);
router.post('/simulate/failure', simulatePaymentFailure);
router.get('/order/:orderId', getPaymentByOrder);

export default router;
