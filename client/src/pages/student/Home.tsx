import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ShoppingBag, 
  Search, 
  Flame, 
  ShieldCheck,
  Star,
  Truck,
  Zap,
  CheckCircle2,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Canteen, FoodItem, Order } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [popularItems, setPopularItems] = useState<FoodItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'veg' | 'jain' | 'quick'>('all');

  // AI Personalized Recommendations State
  const [activeRecTab, setActiveRecTab] = useState<'personalized' | 'quickBites' | 'trending'>('personalized');
  const [personalizedData, setPersonalizedData] = useState<{
    personalized: FoodItem[];
    quickBites: FoodItem[];
    trending: FoodItem[];
  }>({
    personalized: [],
    quickBites: [],
    trending: [],
  });

  useEffect(() => {
    fetchHomeData();
  }, [isAuthenticated]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [canteensRes, foodRes, aiRes] = await Promise.all([
        api.get('/canteens'),
        api.get('/food?limit=12&sort=popularityScore'),
        api.get('/ai/personalized').catch(() => ({ data: { success: false, data: {} } })),
      ]);

      setCanteens(canteensRes.data.data || []);
      setPopularItems(foodRes.data.data || []);

      if (aiRes.data?.success && aiRes.data?.data) {
        setPersonalizedData(aiRes.data.data);
      }

      if (isAuthenticated) {
        const ordersRes = await api.get('/orders');
        const active = ordersRes.data.data?.find((o: Order) => 
          ['placed', 'confirmed', 'pending', 'accepted', 'preparing', 'ready'].includes(o.orderStatus)
        );
        if (active) setActiveOrder(active);
      }
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, item: FoodItem) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, 1);
  };

  const filteredPopularItems = popularItems.filter((item) => {
    if (selectedCategory === 'veg' && !item.vegetarian) return false;
    if (selectedCategory === 'jain' && !item.jainAvailable) return false;
    if (selectedCategory === 'quick' && item.preparationTime > 10) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-12 text-white shadow-2xl border border-slate-800">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-gradient-to-br from-orange-500/30 via-rose-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-600/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-500/30 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-orange-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
            <span>SVKM Mithibai College Campus Dining</span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Order Ahead. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">Skip the Counter Line.</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
            Authentic hot dishes from Ground, 6th & 8th Floor canteens. Choose <strong className="text-white">Self Pickup</strong> or <strong className="text-white">Campus Delivery</strong> directly to your classroom.
          </p>

          {/* Quick Search Input inside Hero */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Frankies, Biryani, Dosa, Juices..."
                className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none backdrop-blur-md"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/canteens"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-extrabold text-white text-xs shadow-lg hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all"
              >
                Browse 3 Canteens <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Key Feature Badges */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[11px]">Campus Delivery</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[11px]">120s Hard SLA</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[11px]">Razorpay Payments</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[11px]">Pure Jain Counters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Order Alert Banner if any */}
      {activeOrder && (
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black animate-pulse backdrop-blur">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white backdrop-blur">
                  Live Order Active
                </span>
                <span className="text-xs font-extrabold uppercase bg-white text-orange-600 px-2 py-0.5 rounded shadow-xs">
                  {activeOrder.orderStatus}
                </span>
              </div>
              <h4 className="font-extrabold text-white text-sm sm:text-base mt-1">
                Token: <span className="font-mono text-amber-200 font-black">#{activeOrder.pickupToken || activeOrder.pickupCode || activeOrder.orderNumber}</span> • {activeOrder.canteen?.name}
              </h4>
            </div>
          </div>
          <Link
            to={`/order-tracking/${activeOrder._id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-orange-600 shadow-md hover:bg-orange-50 transition-all"
          >
            Track Order Status <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Fulfillment Showcase: Pickup vs Delivery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-start gap-4 hover:border-orange-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-gray-900 text-base">Self Pickup</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded">FREE</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Order on app, receive live notification, scan QR code at counter to grab your food instantly.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex items-start gap-4 hover:border-orange-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-gray-900 text-base">Campus Delivery</h3>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2 py-0.5 rounded">₹10 FEE</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Get hot food delivered straight to your classroom, lab, library desk, or department hall.
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Campus Canteens Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Campus Canteens</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select a canteen counter to explore its specialized menu</p>
          </div>
          <Link
            to="/canteens"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/60"
          >
            View All Canteens <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {canteens.map((canteen) => (
            <Link
              key={canteen._id}
              to={`/canteen/${canteen._id}`}
              className="group rounded-3xl bg-white overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={canteen.image || '/images/food/canteen-ground.svg'}
                  alt={canteen.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/food/canteen-ground.svg';
                  }}
                />
                <div className="absolute top-3 left-3 rounded-full bg-slate-950/75 backdrop-blur px-3 py-1 text-xs font-bold text-white flex items-center gap-1.5 shadow-md">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  {canteen.floor}
                </div>
                <div className="absolute top-3 right-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-md">
                  OPEN
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {canteen.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {canteen.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-600 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-orange-500" /> ~{canteen.avgPrepTime || 15} mins avg prep
                  </span>
                  <span className="font-extrabold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Menu <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Smart AI Recommendations Section */}
      <div className="rounded-3xl bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-rose-500/5 p-6 sm:p-8 border border-orange-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                AI Personalized Recommendations
                <span className="text-[10px] bg-orange-100 text-orange-800 font-black px-2.5 py-0.5 rounded-full">
                  SMART
                </span>
              </h2>
              <p className="text-xs text-gray-500">Tailored suggestions from 90 fresh items across canteens</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <button
              onClick={() => setActiveRecTab('personalized')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeRecTab === 'personalized'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setActiveRecTab('quickBites')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeRecTab === 'quickBites'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚡ Quick (&lt;10m)
            </button>
            <button
              onClick={() => setActiveRecTab('trending')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeRecTab === 'trending'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔥 Trending
            </button>
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(personalizedData[activeRecTab] || []).slice(0, 4).map((item) => (
            <div
              key={item._id}
              className="group rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div className="relative h-36 bg-gray-100 overflow-hidden">
                <img
                  src={item.imageUrl || item.image || '/food/placeholder.webp'}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/food/placeholder.webp';
                  }}
                />
                <span
                  className={`absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[10px] font-black text-white shadow ${
                    item.vegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {item.vegetarian ? 'VEG' : 'NON-VEG'}
                </span>
                {item.jainAvailable && (
                  <span className="absolute top-2 right-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow">
                    JAIN
                  </span>
                )}
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-orange-400" /> ~{item.preparationTime}m
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    {typeof item.canteen === 'object' ? `${item.canteen?.name}` : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-black text-orange-600">
                    ₹{item.price}
                  </span>
                  
                  <button
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="px-2.5 py-1 bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Trending Dishes Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Campus Popular Dishes</h2>
            <p className="text-xs text-gray-500 mt-0.5">Most ordered snacks and meals by Mithibai students</p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 text-xs shadow-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl font-bold transition ${selectedCategory === 'all' ? 'bg-orange-600 text-white' : 'text-gray-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('veg')}
              className={`px-3 py-1 rounded-xl font-bold transition ${selectedCategory === 'veg' ? 'bg-emerald-600 text-white' : 'text-gray-600'}`}
            >
              Veg Only
            </button>
            <button
              onClick={() => setSelectedCategory('jain')}
              className={`px-3 py-1 rounded-xl font-bold transition ${selectedCategory === 'jain' ? 'bg-amber-500 text-white' : 'text-gray-600'}`}
            >
              Jain Counter
            </button>
            <button
              onClick={() => setSelectedCategory('quick')}
              className={`px-3 py-1 rounded-xl font-bold transition ${selectedCategory === 'quick' ? 'bg-orange-600 text-white' : 'text-gray-600'}`}
            >
              ⚡ Fast Prep
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPopularItems.slice(0, 8).map((item) => (
            <div
              key={item._id}
              className="group rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={item.imageUrl || item.image || '/food/placeholder.webp'}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/food/placeholder.webp';
                  }}
                />
                <span
                  className={`absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[10px] font-black text-white shadow ${
                    item.vegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {item.vegetarian ? 'VEG' : 'NON-VEG'}
                </span>
                {item.jainAvailable && (
                  <span className="absolute top-2 right-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow">
                    JAIN
                  </span>
                )}
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                    {typeof item.canteen === 'object' ? item.canteen?.name : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-black text-orange-600">
                    ₹{item.price}
                  </span>

                  <button
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};