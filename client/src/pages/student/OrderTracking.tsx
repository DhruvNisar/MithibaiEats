import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Order } from '../../types';
import { getSocket, connectSocket, joinOrderRoom, joinUserRoom } from '../../services/socketService';
import QRCode from 'react-qr-code';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowLeft,
  Check,
  ChefHat,
  ShoppingBag,
  BellRing,
  HelpCircle,
  Truck,
  Building2,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1-second ticker for 120s Hard Demo Timer
  useEffect(() => {
    if (!order) return;

    const interval = setInterval(() => {
      if (order.estimatedCompletionAt) {
        const diff = Math.max(0, Math.floor((new Date(order.estimatedCompletionAt).getTime() - Date.now()) / 1000));
        setTimeLeft(diff);
      } else if (order.lifecycleStartedAt) {
        const startMs = new Date(order.lifecycleStartedAt).getTime();
        const targetMs = startMs + 120000;
        const diff = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
        setTimeLeft(diff);
      } else if (order.createdAt) {
        const startMs = new Date(order.createdAt).getTime();
        const targetMs = startMs + 120000;
        const diff = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  useEffect(() => {
    if (id) {
      fetchOrder();

      const socket = connectSocket();
      joinOrderRoom(id);

      const playChime = () => {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {
          // Audio fallback
        }
      };

      const handleStatusUpdate = (data: any) => {
        console.log('⚡ Socket event received in tracking:', data);
        const updatedOrder = data?.order;
        if (data.orderId === id || updatedOrder?._id === id) {
          const status = updatedOrder?.orderStatus || data.status;
          if (status === 'ready') {
            playChime();
            toast.success('🔔 Your order is READY for pickup at the counter!', {
              duration: 8000,
              icon: '🎉',
            });
          } else {
            toast.success(`Order status: ${status?.toUpperCase()}`);
          }
          if (updatedOrder) setOrder(updatedOrder);
          else fetchOrder();
        }
      };

      socket.on('order:confirmed', handleStatusUpdate);
      socket.on('order:accepted', handleStatusUpdate);
      socket.on('order:preparing', handleStatusUpdate);
      socket.on('order:ready', handleStatusUpdate);
      socket.on('order:completed', handleStatusUpdate);
      socket.on('order:cancelled', handleStatusUpdate);
      socket.on('order:rejected', handleStatusUpdate);
      socket.on('order:status_updated', handleStatusUpdate);

      return () => {
        socket.off('order:confirmed', handleStatusUpdate);
        socket.off('order:accepted', handleStatusUpdate);
        socket.off('order:preparing', handleStatusUpdate);
        socket.off('order:ready', handleStatusUpdate);
        socket.off('order:completed', handleStatusUpdate);
        socket.off('order:rejected', handleStatusUpdate);
        socket.off('order:status_updated', handleStatusUpdate);
      };
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm font-semibold">Connecting to kitchen order tracker...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Order Not Found</h2>
        <Link to="/orders" className="text-orange-600 font-bold mt-4 inline-block">
          ← View Order History
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'placed', label: 'Placed', desc: 'Order received by canteen' },
    { key: 'accepted', label: 'Accepted', desc: 'Kitchen acknowledged order' },
    { key: 'preparing', label: 'Preparing', desc: 'Chefs are preparing your meal' },
    { key: 'ready', label: 'Ready', desc: 'Ready for pickup at counter' },
    { key: 'completed', label: 'Completed', desc: 'Collected & completed' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'pending') return 0;
    return steps.findIndex((s) => s.key === status);
  };

  const currentStepIndex = getStepIndex(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All Orders
      </Link>

      {/* Hero Tracking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-orange-600 tracking-wider">
                Live Order Tracking
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> Live Socket
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-1">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              {order.canteen.name} ({order.canteen.floor})
            </p>
          </div>

          {/* Pickup Token */}
          <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-2xl p-3 sm:px-6 text-center">
            <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider">
              Pickup Token
            </span>
            <div className="text-3xl font-black text-orange-600 tracking-wide font-mono">
              {order.pickupToken || `#${order.orderNumber.slice(-4)}`}
            </div>
          </div>
        </div>

        {/* Live Animated Stepper */}
        <div className="py-8">
          <div className="relative">
            {/* Connecting Bar */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0">
              <div
                className="h-full bg-orange-600 transition-all duration-700 ease-out"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Stepper Nodes */}
            <div className="flex justify-between items-start relative z-10">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center max-w-[80px]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 shadow-sm ${
                        isCurrent
                          ? 'bg-orange-600 text-white ring-4 ring-orange-100 scale-110'
                          : isPassed
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold mt-2 ${
                        isCurrent ? 'text-orange-600' : isPassed ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-gray-400 hidden sm:block mt-0.5 leading-tight">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Hard Demo 120s Timer Banner & Callout */}
        {order.orderStatus !== 'ready' && order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
          <div className="mb-4 bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-lg">
                ⏱️
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
                  Automated Demo Guarantee
                </span>
                <h4 className="text-sm font-extrabold text-white leading-tight">
                  120-Second Hard SLA Counter
                </h4>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black font-mono text-amber-400">
                {timeLeft !== null
                  ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                  : '02:00'}
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Auto-Transitions Active</span>
            </div>
          </div>
        )}

        {/* Current Status Callout */}
        <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0">
              {order.orderStatus === 'ready' ? (
                <BellRing className="w-5 h-5 animate-bounce" />
              ) : order.orderStatus === 'preparing' ? (
                <ChefHat className="w-5 h-5 animate-pulse" />
              ) : order.orderStatus === 'completed' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-orange-950">
                {order.orderStatus === 'ready'
                  ? '🎉 Your Food is Ready for Pickup!'
                  : order.orderStatus === 'preparing'
                  ? '👨‍🍳 The kitchen is cooking your meal...'
                  : order.orderStatus === 'completed'
                  ? '✅ Order Completed. Hope you enjoyed!'
                  : '⏳ Waiting for canteen kitchen confirmation...'}
              </h4>
              <p className="text-xs text-orange-800 mt-0.5">
                {order.orderStatus === 'ready'
                  ? `Proceed to the ${order.canteen.floor} counter and show Token ${order.pickupToken || order.orderNumber}.`
                  : `Estimated preparation time: ~${order.estimatedTime || order.canteen.avgPrepTime} minutes.`}
              </p>
            </div>
          </div>

          {/* Campus Verified Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-xl font-bold text-xs border border-orange-200" title="Verified SVKM Mithibai Canteen Partner">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Campus Verified</span>
          </div>
        </div>
      </div>

      {/* Fulfillment Details & Items Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Delivery Details OR Pickup QR */}
        {order.fulfillmentType === 'delivery' ? (
          <div className="bg-orange-50/70 border-2 border-orange-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-900 pb-2 border-b border-orange-200/60 mb-3">
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-black uppercase tracking-wider">Campus Delivery</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-gray-500 block text-[10px] uppercase">Destination Building</span>
                  <span className="font-extrabold text-gray-900 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-orange-500" />
                    {order.deliveryDetails?.building || 'Main College Building'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block text-[10px] uppercase">Room / Desk Location</span>
                  <span className="font-black text-orange-600 text-sm mt-0.5 block">
                    {order.deliveryDetails?.floorRoom || 'Campus Delivery Spot'}
                  </span>
                </div>
                {order.deliveryDetails?.contactPhone && (
                  <div>
                    <span className="font-bold text-gray-500 block text-[10px] uppercase">Contact Number</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {order.deliveryDetails.contactPhone}
                    </span>
                  </div>
                )}
                {order.deliveryDetails?.deliveryNotes && (
                  <div className="pt-2 border-t border-orange-200/60">
                    <span className="font-bold text-gray-500 block text-[10px] uppercase">Runner Notes</span>
                    <span className="text-xs text-gray-700 italic">"{order.deliveryDetails.deliveryNotes}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-orange-200/60 text-center">
              <span className="text-[10px] font-extrabold uppercase text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full">
                Delivery Fee: ₹{order.deliveryFee || 10}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
              Counter Pickup QR
            </span>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded mb-3">
              Code: {order.pickupCode || order.pickupToken || `#${order.orderNumber.slice(-4)}`}
            </span>
            <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-inner mb-3">
              <QRCode
                value={order.pickupQrToken || `ORDER:${order._id}:${order.orderNumber}`}
                size={140}
                level="M"
              />
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              Scan at counter to confirm pickup
            </span>
          </div>
        )}

        {/* Order Details & Items */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-gray-900 text-sm pb-2 border-b border-gray-100 flex items-center justify-between">
            <span>Ordered Dishes ({order.items.length})</span>
            <span className="text-xs text-gray-500">
              Payment: <b className="uppercase text-gray-800">{order.paymentMethod}</b> (
              {order.paymentStatus})
            </span>
          </h3>

          <div className="divide-y divide-gray-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-800">{item.name}</span>
                  <span className="text-gray-400 ml-2">× {item.quantity}</span>
                </div>
                <span className="font-bold text-gray-900">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-black">
            <span>Total Paid</span>
            <span className="text-orange-600 text-lg">₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};