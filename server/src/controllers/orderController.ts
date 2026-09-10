import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { FoodItem } from '../models/FoodItem';
import { Canteen } from '../models/Canteen';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { generateOrderNumber, generatePickupToken } from '../utils/orderIdGenerator';
import { config } from '../config/env';
import { getSocketServer } from '../sockets/socketManager';
import { orderLifecycleService } from '../services/orderLifecycleService';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { canteenId, items, paymentMethod, specialInstructions, qrSource, fulfillmentType, deliveryDetails } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must have at least one item.' });
      return;
    }

    // Verify canteen exists and is open
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      res.status(404).json({ success: false, message: 'Canteen not found.' });
      return;
    }
    if (!canteen.isOpen) {
      res.status(400).json({ success: false, message: 'This canteen is currently closed.' });
      return;
    }

    // Validate and calculate items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (!foodItem) {
        res.status(404).json({ success: false, message: `Food item not found: ${item.foodItemId}` });
        return;
      }
      if (!foodItem.available || foodItem.stock === 0) {
        res.status(400).json({
          success: false,
          message: `${foodItem.name} is currently unavailable.`,
        });
        return;
      }
      if (foodItem.canteen.toString() !== canteenId) {
        res.status(400).json({ success: false, message: 'Items must be from the same canteen.' });
        return;
      }

      const itemSubtotal = foodItem.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        foodItem: foodItem._id,
        name: foodItem.name,
        price: foodItem.price,
        quantity: item.quantity,
        customizations: item.customizations || {},
        subtotal: itemSubtotal,
      });

      // Decrement stock
      await FoodItem.findByIdAndUpdate(foodItem._id, {
        $inc: { stock: -item.quantity, popularityScore: item.quantity },
        ...(foodItem.stock - item.quantity <= 0 ? { available: false } : {}),
      });
    }

    const platformFee = config.platformFee;
    const packagingFee = config.packagingFee;
    const isDelivery = fulfillmentType === 'delivery';
    const deliveryFee = isDelivery ? 10 : 0;
    const total = subtotal + platformFee + packagingFee + deliveryFee;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      pickupToken: generatePickupToken(),
      user: req.user?._id,
      canteen: canteenId,
      items: orderItems,
      fulfillmentType: isDelivery ? 'delivery' : 'pickup',
      deliveryFee,
      deliveryDetails: isDelivery ? deliveryDetails : undefined,
      subtotal,
      platformFee,
      packagingFee,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      specialInstructions,
      qrSource,
      estimatedTime: canteen.avgPrepTime,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('canteen', 'name slug floor')
      .populate('items.foodItem', 'name image');

    // Update user stats
    await User.findByIdAndUpdate(req.user?._id, {
      $inc: { totalOrders: 1, totalSpent: total },
    });

    // Create notification
    await Notification.create({
      user: req.user?._id,
      title: '🎉 Order Placed!',
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      type: 'order_update',
      orderId: order._id,
    });

    // Emit to admin room and start automated lifecycle
    const io = getSocketServer();
    if (io) {
      io.to(`canteen:${canteenId}`).emit('order:created', {
        order: populatedOrder,
        canteenId,
      });
      io.to('admin:orders').emit('order:created', { order: populatedOrder });
    }

    // Start 120-second automated lifecycle (non-blocking)
    orderLifecycleService.startLifecycle(order).catch((err: Error) => {
      console.error('[Lifecycle] Failed to start lifecycle for order', order.orderNumber, err.message);
    });

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, canteenId, page = '1', limit = '20' } = req.query;
    const user = req.user!;

    const filter: Record<string, unknown> = {};

    if (user.role === 'student') {
      filter.user = user._id;
    } else if (user.role === 'admin') {
      if (canteenId) filter.canteen = canteenId;
    }

    if (status) filter.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('canteen', 'name slug floor')
      .populate('items.foodItem', 'name image price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('canteen', 'name slug floor location')
      .populate('items.foodItem', 'name image price');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Students can only view their own orders
    const orderUserId = (order.user as any)?._id?.toString() || order.user?.toString();
    if (req.user?.role === 'student' && orderUserId !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('canteen user');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const validTransitions: Record<string, string[]> = {
      placed: ['accepted', 'rejected', 'cancelled'],
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['completed'],
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.orderStatus} to ${status}.`,
      });
      return;
    }

    const updateData: Record<string, unknown> = { orderStatus: status };
    const now = new Date();

    if (status === 'accepted') updateData.acceptedAt = now;
    if (status === 'preparing') updateData.preparingAt = now;
    if (status === 'ready') updateData.readyAt = now;
    if (status === 'completed') updateData.completedAt = now;
    if (status === 'rejected') updateData.rejectedAt = now;
    if (status === 'cancelled') updateData.cancelledAt = now;

    if (status === 'completed' || status === 'rejected' || status === 'cancelled') {
      if (order.paymentMethod === 'upi' && status === 'completed') {
        updateData.paymentStatus = 'completed';
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', 'name email')
      .populate('canteen', 'name slug floor');

    // Emit socket event
    const io = getSocketServer();
    if (io) {
      const userId = (order.user as any)?._id?.toString() || (order.user as any)?.toString();
      const canteenId = (order.canteen as any)?._id?.toString() || (order.canteen as any)?.toString();

      const eventMap: Record<string, string> = {
        accepted: 'order:accepted',
        rejected: 'order:rejected',
        preparing: 'order:preparing',
        ready: 'order:ready',
        completed: 'order:completed',
        cancelled: 'order:cancelled',
      };

      const eventName = eventMap[status];
      if (eventName) {
        io.to(`order:${order._id}`).emit(eventName, { order: updatedOrder, orderId: order._id });
        io.to(`user:${userId}`).emit(eventName, { order: updatedOrder, orderId: order._id });
        io.to(`canteen:${canteenId}`).emit('admin:orders', { order: updatedOrder, status });
      }
    }

    // Create notification for student
    const notificationMessages: Record<string, { title: string; message: string }> = {
      accepted: { title: '✅ Order Accepted!', message: `Your order ${order.orderNumber} has been accepted.` },
      rejected: { title: '❌ Order Rejected', message: `Your order ${order.orderNumber} was rejected.` },
      preparing: { title: '👨‍🍳 Preparing Your Order', message: `Your order ${order.orderNumber} is being prepared.` },
      ready: { title: '🔔 Order Ready for Pickup!', message: `Your order ${order.orderNumber} is ready! Please collect it.` },
      completed: { title: '✅ Order Completed', message: `Your order ${order.orderNumber} has been completed. Enjoy!` },
    };

    if (notificationMessages[status]) {
      const userId = (order.user as any)?._id || order.user;
      await Notification.create({
        user: userId,
        ...notificationMessages[status],
        type: 'order_update',
        orderId: order._id,
      });

      // Emit notification
      const io = getSocketServer();
      if (io) {
        const userIdStr = userId.toString();
        const notification = await Notification.findOne({ orderId: order._id }).sort({ createdAt: -1 });
        io.to(`user:${userIdStr}`).emit('notification:new', { notification });
      }
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (order.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    if (['preparing', 'ready', 'completed', 'cancelled', 'rejected'].includes(order.orderStatus)) {
      res.status(400).json({
        success: false,
        message: 'Order can no longer be cancelled. Preparation has already begun.',
      });
      return;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: 'cancelled', cancelledAt: new Date(), paymentStatus: order.paymentStatus === 'completed' ? 'refunded' : order.paymentStatus },
      { new: true }
    ).populate('canteen', 'name slug');

    // Restock items
    for (const item of order.items) {
      await FoodItem.findByIdAndUpdate(item.foodItem, {
        $inc: { stock: item.quantity },
        available: true,
      });
    }

    const io = getSocketServer();
    if (io) {
      const canteenId = (order.canteen as any)?._id?.toString() || order.canteen?.toString();
      const userId = (order.user as any)?._id?.toString() || order.user?.toString();
      io.to(`order:${order._id}`).emit('order:cancelled', { order: updatedOrder, orderId: order._id });
      io.to(`user:${userId}`).emit('order:cancelled', { order: updatedOrder, orderId: order._id });
      io.to(`canteen:${canteenId}`).emit('order:cancelled', { order: updatedOrder, orderId: order._id });
    }

    res.status(200).json({ success: true, data: updatedOrder, message: 'Order cancelled successfully.' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reorder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const originalOrder = await Order.findById(req.params.id).populate('items.foodItem');
    if (!originalOrder) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (originalOrder.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const availableItems = [];
    const unavailableItems = [];

    for (const item of originalOrder.items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (foodItem && foodItem.available && foodItem.stock > 0) {
        availableItems.push({
          foodItemId: foodItem._id,
          name: foodItem.name,
          price: foodItem.price,
          quantity: item.quantity,
          image: foodItem.image,
          customizations: item.customizations,
        });
      } else {
        unavailableItems.push(item.name);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        availableItems,
        unavailableItems,
        canteenId: originalOrder.canteen,
        paymentMethod: originalOrder.paymentMethod,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
