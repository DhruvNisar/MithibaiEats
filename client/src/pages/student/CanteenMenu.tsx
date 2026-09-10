import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Canteen, Category, FoodItem } from '../../types';
import { FoodCard } from '../../components/food/FoodCard';
import { useCart } from '../../context/CartContext';
import {
  Search,
  SlidersHorizontal,
  Clock,
  Sparkles,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  Flame,
  QrCode,
} from 'lucide-react';

export const CanteenMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'jain'>('all');
  const [spicyFilter, setSpicyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price_asc' | 'price_desc' | 'rating'>('popularity');

  const { cart } = useCart();
  const totalCartItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const [canteenRes, catRes, itemsRes] = await Promise.all([
          api.get(`/canteens/${id}`),
          api.get('/categories'),
          api.get(`/food?canteen=${id}&limit=200`),
        ]);

        if (canteenRes.data.success) setCanteen(canteenRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (itemsRes.data.success) setFoodItems(itemsRes.data.data);
      } catch (err) {
        console.error('Failed to load canteen menu:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMenu();
  }, [id]);

  // Client-side filtering & sorting
  const filteredItems = useMemo(() => {
    return foodItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const itemCatSlug = typeof item.category === 'object' ? item.category?.slug : '';
          const itemCatId = typeof item.category === 'object' ? item.category?._id : item.category;
          if (itemCatSlug !== selectedCategory && itemCatId !== selectedCategory) return false;
        }

        // Diet filter
        if (dietFilter === 'veg' && !item.vegetarian) return false;
        if (dietFilter === 'jain' && !item.jainAvailable) return false;

        // Spice filter
        if (spicyFilter !== 'all' && item.spicyLevel !== spicyFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.popularityScore || 0) - (a.popularityScore || 0);
      });
  }, [foodItems, selectedCategory, dietFilter, spicyFilter, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm font-semibold">Loading freshly made canteen menu...</p>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Canteen Not Found</h2>
        <Link to="/canteens" className="text-orange-600 font-bold mt-4 inline-block">
          ← Back to Canteen Selection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Canteen Header Hero */}
      <div className="relative h-64 sm:h-80 bg-gray-900 overflow-hidden">
        <img
          src={canteen.image}
          alt={canteen.name}
          className="w-full h-full object-cover opacity-50"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/food/canteen-ground.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-6">
          <div>
            <Link
              to="/canteens"
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Canteens
            </Link>
          </div>

          <div className="space-y-2 text-white">
            <div className="flex items-center gap-2">
              <span className="bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                {canteen.floor}
              </span>
              <span className="bg-black/50 backdrop-blur-md text-white text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-400" /> ~{canteen.avgPrepTime}m avg preparation
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{canteen.name}</h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl line-clamp-2">
              {canteen.description}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          {/* Top row: Search and Quick Toggles */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${canteen.name} (${foodItems.length} items)...`}
                className="w-full text-xs pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>

            {/* Dietary Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setDietFilter('all')}
                className={`text-xs px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                  dietFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('veg')}
                className={`text-xs px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                  dietFilter === 'veg'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}
              >
                🥦 Veg Only
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('jain')}
                className={`text-xs px-3 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  dietFilter === 'jain'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Pure Jain
              </button>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs py-2 px-2.5 bg-gray-100 border-none rounded-xl font-semibold text-gray-700 focus:ring-2 focus:ring-orange-500"
              >
                <option value="popularity">🔥 Popular</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_asc">₹ Price: Low to High</option>
                <option value="price_desc">₹ Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Items ({foodItems.length})
            </button>
            {categories.map((cat) => {
              const count = foodItems.filter((i) => {
                const itemCatSlug = typeof i.category === 'object' ? i.category?.slug : '';
                return itemCatSlug === cat.slug;
              }).length;

              if (count === 0) return null;

              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    selectedCategory === cat.slug
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(location.state as any)?.fromQR && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-emerald-900">QR Code Scanned Successfully</p>
                <p className="text-[11px] text-emerald-700">Ordering directly for pickup at <b>{canteen.name} ({canteen.floor})</b></p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full">
              Live Counter
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-gray-900">
            {selectedCategory === 'all' ? 'All Dishes' : selectedCategory.toUpperCase()}
            <span className="text-gray-400 font-normal text-xs ml-2">
              ({filteredItems.length} available)
            </span>
          </h2>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <p className="text-gray-500 font-medium text-sm">No food items matched your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDietFilter('all');
                setSpicyFilter('all');
              }}
              className="mt-3 text-orange-600 font-bold text-xs hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <FoodCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-slide-up">
          <Link
            to="/checkout"
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
                {totalCartItems}
              </div>
              <div>
                <div className="text-xs text-orange-100 font-medium">Items in Cart</div>
                <div className="font-extrabold text-base">₹{cart.total.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-sm bg-white/20 px-4 py-2 rounded-xl group-hover:bg-white/30 transition">
              <span>View Order</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};