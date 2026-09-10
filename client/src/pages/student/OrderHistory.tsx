import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Order } from '../../types';
import { useCart } from '../../context/CartContext';
import { Clock, MapPin, ArrowRight, RotateCcw, Star, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, clearCart } = useCart();

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = async (order: Order) => {
    clearCart();
    for (const item of order.items) {
      if (typeof item.foodItem === 'object') {
        addItem(item.foodItem, item.quantity, item.customizations);
      }
    }
    toast.success('Items added to cart! Proceed to checkout.');
  };

  const handleOpenReview = (order: Order) => {
    setReviewOrder(order);
    if (order.items.length > 0) {
      const firstId = typeof order.items[0].foodItem === 'object' ? order.items[0].foodItem._id : order.items[0].foodItem;
      setSelectedFoodId(firstId as string);
    }
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder || !selectedFoodId) return;
    setReviewLoading(true);
    try {
      const res = await api.post('/reviews', {
        orderId: reviewOrder._id,
        foodItemId: selectedFoodId,
        rating,
        comment,
      });
      if (res.data.success) {
        toast.success('Thank you for your review!');
        setReviewOrder(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order History</h1>
          <p className="text-xs text-gray-500 mt-0.5">Past campus orders & real-time tracking</p>
        </div>
        <Link
          to="/canteens"
          className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-xl transition"
        >
          New Order +
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No orders yet</h3>
          <p className="text-xs text-gray-400 mt-1 mb-5">
            You haven't ordered from any of the 3 canteens yet.
          </p>
          <Link
            to="/canteens"
            className="px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition"
          >
            Explore Canteen Menus
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCompleted = order.orderStatus === 'completed';
            const isActive = ['placed', 'pending', 'accepted', 'preparing', 'ready'].includes(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-sm">#{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          order.orderStatus === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'ready'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      {order.canteen?.name} ({order.canteen?.floor})
                    </span>
                    {order.pickupToken && (
                      <span className="bg-orange-50 text-orange-700 font-mono font-bold px-2 py-0.5 rounded-md border border-orange-200">
                        Token {order.pickupToken}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs text-gray-600">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {item.quantity} × {item.name}
                      </span>
                      <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-sm font-extrabold text-gray-900">
                    Total: <span className="text-orange-600">₹{order.total.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive && (
                      <Link
                        to={`/order-tracking/${order._id}`}
                        className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Live Tracking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {isCompleted && (
                      <>
                        <button
                          onClick={() => handleOpenReview(order)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 font-bold rounded-xl text-gray-600 transition flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Review</span>
                        </button>

                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3.5 py-1.5 bg-gray-900 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Review Food Item</h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Item</label>
              <select
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500"
              >
                {reviewOrder.items.map((item, idx) => {
                  const itemId = typeof item.foodItem === 'object' ? item.foodItem._id : item.foodItem;
                  return (
                    <option key={idx} value={itemId as string}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Comment</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (taste, spice, portion size)..."
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={handleSubmitReview}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};