import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Payment } from '../models/Payment';
import { Order } from '../models/Order';
import { generatePaymentId, generateTransactionRef } from '../utils/orderIdGenerator';
import { getSocketServer } from '../sockets/socketManager';
import { Notification } from '../models/Notification';
import { razorpayService } from '../services/razorpayService';
import { orderLifecycleService } from '../services/orderLifecycleService';

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { orderId, method, upiId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const orderUserId = (order.user as any)?._id?.toString() || order.user?.toString();
    if (orderUserId !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const existingPayment = await Payment.findOne({ order: orderId, status: { $in: ['initiated', 'processing', 'success'] } });
    if (existingPayment) {
      res.status(400).json({ success: false, message: 'Payment already exists for this order.' });
      return;
    }

    const payment = await Payment.create({
      paymentId: generatePaymentId(),
      order: orderId,
      user: req.user._id,
      method,
      amount: order.total,
      status: 'initiated',
      upiId: upiId || 'mithibai-eats@demo',
    });

    // Update order payment status
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'pending' });

    // Generate fake UPI QR data
    const upiQRData = `upi://pay?pa=${payment.upiId}&pn=MithibaiEats&am=${order.total}&cu=INR&tn=Order_${order.orderNumber}`;

    res.status(201).json({
      success: true,
      data: {
        payment,
        upiQRData,
        upiId: payment.upiId,
        amount: order.total,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const simulatePaymentSuccess = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { paymentId } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found.' });
      return;
    }

    const paymentUserId = (payment.user as any)?._id?.toString() || payment.user?.toString();
    if (paymentUserId !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const transactionRef = generateTransactionRef();

    const updatedPayment = await Payment.findByIdAndUpdate(
      payment._id,
      {
        status: 'success',
        transactionReference: transactionRef,
        simulatedAt: new Date(),
      },
      { new: true }
    );

    // Update order payment status
    const updatedOrder = await Order.findByIdAndUpdate(
      payment.order,
      { paymentStatus: 'completed' },
      { new: true }
    ).populate('canteen', 'name slug');

    // Create success notification
    await Notification.create({
      user: req.user._id,
      title: '💳 Payment Successful!',
      message: `Your payment of ₹${payment.amount} was successful. Transaction: ${transactionRef}`,
      type: 'payment',
      orderId: payment.order,
    });

    // Emit socket event
    const io = getSocketServer();
    if (io) {
      io.to(`user:${req.user._id}`).emit('payment:success', {
        payment: updatedPayment,
        order: updatedOrder,
        transactionRef,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment simulated successfully! (Demo only)',
      data: {
        payment: updatedPayment,
        transactionRef,
        order: updatedOrder,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const simulatePaymentFailure = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { paymentId } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found.' });
      return;
    }

    const paymentUserId = (payment.user as any)?._id?.toString() || payment.user?.toString();
    if (paymentUserId !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      payment._id,
      { status: 'failed', simulatedAt: new Date() },
      { new: true }
    );

    await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'failed' });

    await Notification.create({
      user: req.user._id,
      title: '❌ Payment Failed',
      message: `Your payment of ₹${payment.amount} failed. Please try again.`,
      type: 'payment',
      orderId: payment.order,
    });

    res.status(200).json({
      success: true,
      message: 'Payment failure simulated. (Demo only)',
      data: updatedPayment,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPaymentByOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const payment = await Payment.findOne({ order: req.params.orderId }).lean();
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found.' });
      return;
    }

    const paymentUserId = (payment.user as any)?._id?.toString() || payment.user?.toString();
    if (paymentUserId !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRazorpayKey = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    keyId: razorpayService.getPublicKey(),
  });
};

export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const receipt = `rcpt_${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
    const razorpayOrder = await razorpayService.createOrder(order.total, receipt, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userEmail: req.user.email,
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    await Payment.create({
      paymentId: generatePaymentId(),
      order: order._id,
      user: req.user._id,
      method: 'online',
      amount: order.total,
      currency: razorpayOrder.currency,
      status: 'CREATED',
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayService.getPublicKey(),
        orderId: order._id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyRazorpayPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid payment signature.' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    order.paymentStatus = 'completed';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.confirmedAt = new Date();
    await order.save();

    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: 'CAPTURED',
        razorpayPaymentId,
        razorpaySignature,
        simulatedAt: new Date(),
      }
    );

    // Trigger Socket notification
    const io = getSocketServer();
    if (io) {
      io.to(`order:${order._id}`).emit('order:confirmed', { orderId: order._id, status: 'confirmed' });
    }

    // Start 120-second hard demo SLA lifecycle
    orderLifecycleService.startLifecycle(order).catch((err) => {
      console.error('[Lifecycle] Error starting lifecycle after Razorpay verification:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Razorpay payment verified successfully.',
      data: order,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (signature && !razorpayService.verifyWebhookSignature(rawBody, signature)) {
      res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && payload) {
      const razorpayOrderId = payload.order_id;
      const razorpayPaymentId = payload.id;

      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: 'completed', razorpayPaymentId }
      );
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'CAPTURED', razorpayPaymentId }
      );
    }

    res.status(200).json({ status: 'ok' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

