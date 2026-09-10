import { Order, IOrder } from '../models/Order';
import { Notification } from '../models/Notification';
import { getSocketServer } from '../sockets/socketManager';

/**
 * Automated 120-Second Demo Order Lifecycle Engine
 *
 * Timeline:
 *  0s:   placed (lifecycleStartedAt)
 *  20s:  confirmed
 *  50s:  preparing
 *  90s:  ready (triggers audio chime + pickup code + pickup QR token)
 *  120s: completed
 *
 * Hard SLA limit: 120 seconds.
 */

class OrderLifecycleService {
  private activeTimers = new Map<string, NodeJS.Timeout[]>();
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startSweepTicker();
  }

  /**
   * Starts the 120-second automated lifecycle for a campus order.
   */
  public async startLifecycle(order: IOrder): Promise<void> {
    const orderId = order._id.toString();
    this.clearTimers(orderId);

    const now = new Date();
    order.lifecycleStartedAt = order.lifecycleStartedAt || now;
    order.estimatedCompletionAt = new Date(order.lifecycleStartedAt.getTime() + 120 * 1000);
    order.orderStatus = 'placed';
    order.slaBreached = false;

    // Ensure 4-digit pickup code
    if (!order.pickupCode) {
      order.pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
    }
    if (!order.pickupQrToken) {
      order.pickupQrToken = `pickup_${order._id}_${Date.now()}`;
    }

    await order.save();

    // Emit initial placed event
    this.broadcastEvent(order, 'order:created');

    const timeouts: NodeJS.Timeout[] = [];

    // T+20s -> confirmed
    timeouts.push(
      setTimeout(async () => {
        await this.transitionStatus(orderId, 'confirmed');
      }, 20 * 1000)
    );

    // T+50s -> preparing
    timeouts.push(
      setTimeout(async () => {
        await this.transitionStatus(orderId, 'preparing');
      }, 50 * 1000)
    );

    // T+90s -> ready
    timeouts.push(
      setTimeout(async () => {
        await this.transitionStatus(orderId, 'ready');
      }, 90 * 1000)
    );

    // T+120s -> completed
    timeouts.push(
      setTimeout(async () => {
        await this.transitionStatus(orderId, 'completed');
      }, 120 * 1000)
    );

    this.activeTimers.set(orderId, timeouts);
  }

  /**
   * Transitions an order to a new status and emits Socket.IO events.
   */
  public async transitionStatus(
    orderId: string,
    newStatus: 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled',
    manualOverride: boolean = false
  ): Promise<IOrder | null> {
    try {
      const order = await Order.findById(orderId).populate('canteen', 'name slug floor').populate('user', 'name email phone');
      if (!order) return null;

      // Cannot advance cancelled or already completed orders
      if (order.orderStatus === 'cancelled' || (order.orderStatus === 'completed' && !manualOverride)) {
        return order;
      }

      const now = new Date();
      order.orderStatus = newStatus;

      if (newStatus === 'confirmed') order.confirmedAt = now;
      if (newStatus === 'preparing') order.preparingAt = now;
      if (newStatus === 'ready') order.readyAt = now;
      if (newStatus === 'completed') {
        order.completedAt = now;
        this.clearTimers(orderId);
      }
      if (newStatus === 'cancelled') {
        order.cancelledAt = now;
        this.clearTimers(orderId);
      }

      // Check SLA breach if elapsed > 120s
      if (order.lifecycleStartedAt) {
        const elapsed = (now.getTime() - new Date(order.lifecycleStartedAt).getTime()) / 1000;
        if (elapsed > 120 && newStatus !== 'completed') {
          order.slaBreached = true;
        }
      }

      await order.save();

      // Broadcast Socket.IO event
      const eventName = `order:${newStatus}`;
      this.broadcastEvent(order, eventName);

      // Create Notification
      const titles: Record<string, string> = {
        confirmed: 'Order Confirmed',
        preparing: 'Kitchen Preparing Your Food',
        ready: 'Order Ready for Pickup!',
        completed: 'Order Completed',
        cancelled: 'Order Cancelled',
      };
      const messages: Record<string, string> = {
        confirmed: `Your order #${order.orderNumber} has been confirmed.`,
        preparing: `The chef is preparing your meal fresh.`,
        ready: `Pickup token #${order.pickupToken || order.pickupCode} is ready at the counter!`,
        completed: `Thank you for ordering at Mithibai Eats!`,
        cancelled: `Your order #${order.orderNumber} was cancelled.`,
      };

      if (titles[newStatus]) {
        await Notification.create({
          user: order.user,
          title: titles[newStatus],
          message: messages[newStatus],
          type: 'order_update',
          orderId: order._id,
        });
      }

      return order;
    } catch (err) {
      console.error(`Error transitioning order ${orderId} to ${newStatus}:`, err);
      return null;
    }
  }

  /**
   * Computes mathematical order status from server timestamps.
   * Ensures that on page refresh or reconnection, status is 100% accurate.
   */
  public computeCurrentState(order: IOrder): {
    computedStatus: string;
    elapsedSeconds: number;
    remainingSeconds: number;
    slaBreached: boolean;
  } {
    if (order.orderStatus === 'cancelled' || order.orderStatus === 'rejected') {
      return {
        computedStatus: order.orderStatus,
        elapsedSeconds: 0,
        remainingSeconds: 0,
        slaBreached: false,
      };
    }

    if (order.orderStatus === 'completed') {
      return {
        computedStatus: 'completed',
        elapsedSeconds: 120,
        remainingSeconds: 0,
        slaBreached: !!order.slaBreached,
      };
    }

    const start = order.lifecycleStartedAt ? new Date(order.lifecycleStartedAt).getTime() : new Date(order.createdAt).getTime();
    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - start) / 1000));
    const remaining = Math.max(0, 120 - elapsed);
    const slaBreached = elapsed > 120;

    let computedStatus = 'placed';
    if (elapsed >= 120) computedStatus = 'completed';
    else if (elapsed >= 90) computedStatus = 'ready';
    else if (elapsed >= 50) computedStatus = 'preparing';
    else if (elapsed >= 20) computedStatus = 'confirmed';

    return {
      computedStatus,
      elapsedSeconds: elapsed,
      remainingSeconds: remaining,
      slaBreached,
    };
  }

  /**
   * Reconciles DB status if current time indicates a forward progression.
   */
  public async reconcileOrder(order: IOrder): Promise<IOrder> {
    const { computedStatus, slaBreached } = this.computeCurrentState(order);
    if (
      order.orderStatus !== 'cancelled' &&
      order.orderStatus !== 'rejected' &&
      computedStatus !== order.orderStatus
    ) {
      order.orderStatus = computedStatus as any;
      if (computedStatus === 'completed' && !order.completedAt) order.completedAt = new Date();
      if (computedStatus === 'ready' && !order.readyAt) order.readyAt = new Date();
      if (computedStatus === 'preparing' && !order.preparingAt) order.preparingAt = new Date();
      if (computedStatus === 'confirmed' && !order.confirmedAt) order.confirmedAt = new Date();
      if (slaBreached) order.slaBreached = true;
      await order.save();
    }
    return order;
  }

  /**
   * Broadcasts to order room, user room, canteen room, and admin console.
   */
  private broadcastEvent(order: IOrder, eventName: string): void {
    const io = getSocketServer();
    if (!io) return;

    const orderId = order._id.toString();
    const userId = (order.user as any)?._id?.toString() || order.user?.toString();
    const canteenId = (order.canteen as any)?._id?.toString() || order.canteen?.toString();

    const payload = {
      orderId,
      order,
      status: order.orderStatus,
      pickupToken: order.pickupToken,
      pickupCode: order.pickupCode,
      pickupQrToken: order.pickupQrToken,
      estimatedCompletionAt: order.estimatedCompletionAt,
      timestamp: new Date(),
    };

    io.to(`order:${orderId}`).emit(eventName, payload);
    io.to(`order:${orderId}`).emit('order:status_updated', payload);
    if (userId) io.to(`user:${userId}`).emit(eventName, payload);
    if (canteenId) io.to(`canteen:${canteenId}`).emit(eventName, payload);
    io.to('admin:orders').emit(eventName, payload);
  }

  /**
   * Background sweep ticker: runs every 5 seconds to advance any live orders.
   */
  private startSweepTicker(): void {
    if (this.sweepInterval) clearInterval(this.sweepInterval);

    this.sweepInterval = setInterval(async () => {
      try {
        const liveOrders = await Order.find({
          orderStatus: { $in: ['placed', 'confirmed', 'preparing', 'ready'] },
        });

        for (const order of liveOrders) {
          const { computedStatus, slaBreached } = this.computeCurrentState(order);
          if (computedStatus !== order.orderStatus) {
            await this.transitionStatus(order._id.toString(), computedStatus as any);
          } else if (slaBreached && !order.slaBreached) {
            order.slaBreached = true;
            await order.save();
            const io = getSocketServer();
            if (io) {
              io.to('admin:orders').emit('order:sla_breached', { orderId: order._id, orderNumber: order.orderNumber });
            }
          }
        }
      } catch (err) {
        // Silent catch for background sweep
      }
    }, 5000);
  }

  public clearTimers(orderId: string): void {
    const timeouts = this.activeTimers.get(orderId);
    if (timeouts) {
      timeouts.forEach((t) => clearTimeout(t));
      this.activeTimers.delete(orderId);
    }
  }
}

export const orderLifecycleService = new OrderLifecycleService();
