import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SimulatedUPIModal } from '../../components/payment/SimulatedUPIModal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  Clock,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Truck,
  Building2,
  Phone,
  FileText,
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart, setFulfillmentType } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'cash'>('razorpay');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  // Delivery details state
  const [building, setBuilding] = useState('Main College Building');
  const [floorRoom, setFloorRoom] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Simulated UPI Modal state
  const [createdOrder, setCreatedOrder] = useState<{ id: string; orderNumber: string; total: number } | null>(null);
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm mb-6">
          Looks like you haven't added any college favorites yet.
        </p>
        <Link
          to="/canteens"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm shadow-md transition"
        >
          Explore Campus Canteens
        </Link>
      </div>
    );
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to place an order.');
      navigate('/login');
      return;
    }

    if (cart.fulfillmentType === 'delivery' && !floorRoom.trim()) {
      toast.error('Please provide your floor and room/desk number for campus delivery.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        canteenId: cart.canteenId,
        items: cart.items.map((item) => ({
          foodItemId: item.foodItem._id,
          quantity: item.quantity,
          customizations: item.customizations,
        })),
        fulfillmentType: cart.fulfillmentType || 'pickup',
        deliveryDetails: cart.fulfillmentType === 'delivery' ? {
          building,
          floorRoom: floorRoom.trim(),
          contactPhone: contactPhone.trim() || user?.phone || '',
          deliveryNotes: deliveryNotes.trim() || undefined,
        } : undefined,
        paymentMethod: paymentMethod === 'razorpay' ? 'online' : paymentMethod,
        specialInstructions: specialInstructions.trim() || undefined,
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        const order = res.data.data;

        if (paymentMethod === 'razorpay') {
          // Razorpay flow
          try {
            const rzpRes = await api.post('/payments/razorpay/create-order', { orderId: order._id });
            const { id: razorpayOrderId, amount, currency, keyId } = rzpRes.data.data;

            const loaded = await loadRazorpayScript();
            if (loaded && (window as any).Razorpay) {
              const options = {
                key: keyId,
                amount,
                currency,
                name: 'Mithibai Eats',
                description: `Order #${order.orderNumber}`,
                image: '/logo192.png',
                order_id: razorpayOrderId,
                handler: async (response: any) => {
                  try {
                    await api.post('/payments/razorpay/verify', {
                      orderId: order._id,
                      razorpayOrderId: response.razorpay_order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpaySignature: response.razorpay_signature,
                    });
                    toast.success('🎉 Razorpay Payment Verified!');
                    clearCart();
                    navigate(`/order-tracking/${order._id}`);
                  } catch (err: any) {
                    toast.error('Payment verification failed.');
                  }
                },
                prefill: {
                  name: user?.name || '',
                  email: user?.email || '',
                  contact: contactPhone || user?.phone || '',
                },
                theme: {
                  color: '#ea580c',
                },
              };

              const rzp = new (window as any).Razorpay(options);
              rzp.open();
            } else {
              // Fallback to auto-verification simulation if script blocked by firewall
              toast.success('Razorpay Test Mode: Auto-verifying order...');
              await api.post('/payments/razorpay/verify', {
                orderId: order._id,
                razorpayOrderId,
                razorpayPaymentId: `pay_test_${Math.random().toString(36).substring(2, 9)}`,
                razorpaySignature: 'demo_signature_valid',
              });
              clearCart();
              navigate(`/order-tracking/${order._id}`);
            }
          } catch (rzpErr: any) {
            toast.error(rzpErr.response?.data?.message || 'Razorpay order creation failed.');
          }
        } else if (paymentMethod === 'upi') {
          // Open simulated UPI payment modal
          setCreatedOrder({
            id: order._id,
            orderNumber: order.orderNumber,
            total: order.total,
          });
          setIsUPIModalOpen(true);
        } else {
          // Cash
          toast.success(`Order ${order.orderNumber} placed! ${cart.fulfillmentType === 'delivery' ? 'Pay cash to delivery runner.' : 'Pay cash at counter.'}`);
          clearCart();
          navigate(`/order-tracking/${order._id}`);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handleUPISuccess = (orderId: string) => {
    setIsUPIModalOpen(false);
    clearCart();
    navigate(`/order-tracking/${orderId}`);
  };

  const isDelivery = cart.fulfillmentType === 'delivery';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/canteens"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Continue browsing
      </Link>

      {/* Fulfillment Selection Tabs (Self Pickup vs Campus Delivery) */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs mb-8">
        <span className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-2">
          Choose How You Want Your Food
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFulfillmentType('pickup')}
            className={`p-4 rounded-2xl border-2 transition flex items-center gap-3 text-left ${
              !isDelivery
                ? 'border-orange-600 bg-orange-50/60 shadow-sm ring-1 ring-orange-500/20'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${!isDelivery ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                Self Pickup
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">FREE</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Collect at Canteen Counter with QR code</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFulfillmentType('delivery')}
            className={`p-4 rounded-2xl border-2 transition flex items-center gap-3 text-left ${
              isDelivery
                ? 'border-orange-600 bg-orange-50/60 shadow-sm ring-1 ring-orange-500/20'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isDelivery ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                Campus Delivery
                <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-1.5 py-0.5 rounded">₹10 FEE</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Delivered to your classroom, lab, or desk</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Notes */}
        <div className="md:col-span-2 space-y-6">
          {/* Canteen Summary */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-black uppercase text-orange-600 tracking-wider">
                  Selected Canteen
                </span>
                <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">
                  {cart.canteenName || 'Campus Canteen'}
                </h2>
              </div>
              <span className="text-xs bg-orange-50 text-orange-700 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                {isDelivery ? <Truck className="w-3.5 h-3.5 text-orange-600" /> : <MapPin className="w-3.5 h-3.5 text-orange-600" />}
                <span>{isDelivery ? 'Campus Delivery' : 'Self Pickup'}</span>
              </span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-gray-100 mt-4">
              {cart.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.foodItem.imageUrl || item.foodItem.image || '/food/placeholder.webp'}
                      alt={item.foodItem.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/food/placeholder.webp';
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.foodItem.name}</h4>
                      <span className="text-xs font-semibold text-gray-500">
                        ₹{item.foodItem.price} × {item.quantity}
                      </span>
                      {/* Customizations summary */}
                      {Object.keys(item.customizations || {}).length > 0 && (
                        <div className="text-[11px] text-orange-600 flex flex-wrap gap-1 mt-0.5">
                          {Object.entries(item.customizations).map(([k, v], cIdx) => (
                            <span key={cIdx} className="bg-orange-50 px-1.5 py-0.5 rounded">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.foodItem._id, item.quantity - 1, item.customizations)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-white text-xs"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.foodItem._id, item.quantity + 1, item.customizations)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-white text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Delivery Address Form (If Delivery Selected) */}
          {isDelivery && (
            <div className="bg-orange-50/50 border-2 border-orange-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-orange-900 pb-2 border-b border-orange-200/60">
                <Truck className="w-5 h-5 text-orange-600" />
                <h3 className="font-extrabold text-sm">Campus Delivery Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-orange-500" /> Select SVKM Building
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Main College Building">Main College Building (Vile Parle)</option>
                    <option value="Engineering & Tech Block">Engineering & Tech Block</option>
                    <option value="NMIMS Building Wing">NMIMS Building Wing</option>
                    <option value="Management & Commerce Hall">Management & Commerce Hall</option>
                    <option value="Library & Reading Complex">Library & Reading Complex</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> Floor & Room / Desk No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={floorRoom}
                    onChange={(e) => setFloorRoom(e.target.value)}
                    placeholder="e.g. 4th Floor, Room 402 or Library Desk 12"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-orange-500" /> Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-orange-500" /> Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Call when outside classroom"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Kitchen Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Special Kitchen Instructions
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please pack extra tissue & green chutney, less spicy..."
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
            <span className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
              Choose Payment Method
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Razorpay Online */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'razorpay'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs ring-1 ring-orange-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5 flex-wrap">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    Razorpay Online
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                      TEST
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    UPI, Credit/Debit Cards, NetBanking & Wallets via Razorpay SDK.
                  </p>
                </div>
              </label>

              {/* Simulated UPI */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'upi'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Simulated UPI
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Instant 1-click test payment with QR code preview.
                  </p>
                </div>
              </label>

              {/* Cash at Counter */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'cash'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Pay Cash
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Pay cash directly at the canteen register or to delivery runner.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Bill Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs sticky top-24">
            <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
              Bill Details
            </h3>

            <div className="space-y-3 py-4 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Campus Platform Fee</span>
                <span className="font-bold text-gray-900">₹{cart.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Eco Packaging Fee</span>
                <span className="font-bold text-gray-900">₹{cart.packagingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fulfillment ({isDelivery ? 'Campus Delivery' : 'Self Pickup'})</span>
                <span className="font-bold text-orange-600">
                  {isDelivery ? `₹${(cart.deliveryFee || 10).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-extrabold text-gray-900">To Pay</span>
                <span className="text-2xl font-black text-orange-600">₹{cart.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-500 mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>Estimated pickup ready in ~10-15 minutes</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Confirm Order</span>
                  <span>• ₹{cart.total.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Simulated UPI Modal */}
      {isUPIModalOpen && createdOrder && (
        <SimulatedUPIModal
          orderId={createdOrder.id}
          orderNumber={createdOrder.orderNumber}
          amount={createdOrder.total}
          isOpen={isUPIModalOpen}
          onSuccess={handleUPISuccess}
          onCancel={() => {
            setIsUPIModalOpen(false);
            // Route to order tracking even if cancelled so user can retry or pay cash
            if (createdOrder) {
              clearCart();
              navigate(`/order-tracking/${createdOrder.id}`);
            }
          }}
        />
      )}
    </div>
  );
};