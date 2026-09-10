import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Flame, 
  ShieldCheck, 
  ShoppingBag, 
  Plus, 
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import api from '../../services/api';
import { FoodItem, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CustomizationModal } from '../../components/food/CustomizationModal';
import toast from 'react-hot-toast';

export const FoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [food, setFood] = useState<FoodItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{ avgRating?: number; totalReviews?: number }>({});
  const [loading, setLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // New review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchFoodAndReviews();
  }, [id]);

  const fetchFoodAndReviews = async () => {
    try {
      setLoading(true);
      const [foodRes, reviewsRes] = await Promise.all([
        api.get(`/food/${id}`),
        api.get(`/reviews/food/${id}`)
      ]);
      setFood(foodRes.data.data);
      setReviews(reviewsRes.data.data || []);
      setReviewStats(reviewsRes.data.stats || {});
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load food details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (customizations?: Record<string, string>) => {
    if (!food) return;
    const added = addItem(food, 1, customizations);
    if (added !== false) {
      toast.success(`Added ${food.name} to cart!`);
    }
    setIsCustomizing(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    if (!food) return;

    try {
      setSubmittingReview(true);
      // Fetch user's orders to find a valid orderId containing this item
      const ordersRes = await api.get('/orders');
      const completedOrder = ordersRes.data.data?.find((o: any) => 
        o.orderStatus === 'completed' && 
        o.items.some((it: any) => (it.foodItem?._id || it.foodItem) === food._id)
      );

      if (!completedOrder) {
        toast.error('You can only review items from completed orders you have placed!');
        return;
      }

      await api.post('/reviews', {
        foodItemId: food._id,
        orderId: completedOrder._id,
        rating: newRating,
        comment: newComment
      });

      toast.success('Thank you! Your review was submitted.');
      setNewComment('');
      fetchFoodAndReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4 text-center">
        <p className="text-gray-500 text-lg">Dish not found or no longer available.</p>
        <button
          onClick={() => navigate('/canteens')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Canteens
        </button>
      </div>
    );
  }

  const canteenObj = typeof food.canteen === 'object' ? food.canteen : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Main food card */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 grid grid-cols-1 md:grid-cols-2">
        {/* Left: Food Image & Overlays */}
        <div className="relative h-72 sm:h-96 md:h-full min-h-[320px] bg-amber-50">
          <img
            src={food.imageUrl || food.image || '/food/placeholder.webp'}
            alt={food.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/food/placeholder.webp';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow ${
                food.vegetarian ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              {food.vegetarian ? 'Vegetarian' : 'Non-Veg'}
            </span>

            {food.jainAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                <ShieldCheck className="h-3.5 w-3.5" /> Jain Available
              </span>
            )}
          </div>

          {canteenObj && (
            <div className="absolute bottom-4 left-4 right-4">
              <Link
                to={`/canteen/${canteenObj._id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-black/70 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/80 transition-colors"
              >
                <span>📍 {canteenObj.name} ({canteenObj.floor})</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  {food.name}
                </h1>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {food.description}
                </p>
              </div>
            </div>

            {/* Price & Rating Row */}
            <div className="mt-4 flex items-center justify-between border-y border-gray-100 py-3">
              <div className="text-3xl font-extrabold text-amber-600">
                ₹{food.price}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{food.rating ? food.rating.toFixed(1) : 'New'}</span>
                </div>
                <span className="text-xs text-gray-400">
                  ({food.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Stats / Pills */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-2.5 text-center">
                <Clock className="h-4 w-4 text-gray-500 mb-1" />
                <span className="text-xs text-gray-400">Prep Time</span>
                <span className="text-xs font-bold text-gray-800">{food.preparationTime || 15} mins</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-2.5 text-center">
                <Flame className="h-4 w-4 text-orange-500 mb-1" />
                <span className="text-xs text-gray-400">Spice Level</span>
                <span className="text-xs font-bold capitalize text-gray-800">
                  {food.spicyLevel?.replace('_', ' ') || 'Mild'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-2.5 text-center">
                <Award className="h-4 w-4 text-purple-500 mb-1" />
                <span className="text-xs text-gray-400">Popularity</span>
                <span className="text-xs font-bold text-gray-800">
                  {food.popularityScore ? `${food.popularityScore}/100` : 'Trending'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {food.tags && food.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {food.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Customizations preview if any */}
            {food.customizations && food.customizations.length > 0 && (
              <div className="mt-4 rounded-xl bg-amber-50/50 p-3 border border-amber-100/60">
                <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">
                  Customization Options Available:
                </p>
                <div className="space-y-1">
                  {food.customizations.map((c) => (
                    <div key={c.name} className="text-xs text-amber-800">
                      <span className="font-semibold">{c.name}:</span> {c.options.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            {food.available && food.stock > 0 ? (
              <div className="flex gap-3">
                {food.customizations && food.customizations.length > 0 ? (
                  <button
                    onClick={() => setIsCustomizing(true)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 px-6 font-bold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600 active:scale-[0.98] transition-all"
                  >
                    <Sparkles className="h-5 w-5" /> Customize & Add
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToCart()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 px-6 font-bold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600 active:scale-[0.98] transition-all"
                  >
                    <Plus className="h-5 w-5" /> Add to Cart (₹{food.price})
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-rose-50 p-3 text-center text-sm font-semibold text-rose-600">
                Currently Out of Stock in Kitchen
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="mt-10 rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              Student Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-gray-500">Verified feedback from Mithibai students</p>
          </div>

          {food.rating ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-amber-900 font-bold">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-lg">{food.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">/ 5.0</span>
            </div>
          ) : null}
        </div>

        {/* Write a Review Section */}
        <div className="mb-8 rounded-2xl bg-gray-50 p-4 sm:p-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Leave a Review</h3>
          <p className="text-xs text-gray-500 mb-4">
            Only students who have ordered and received this dish can submit a review.
          </p>
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    className="p-1 rounded hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        s <= newRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Feedback
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="How was the taste, portion size, and presentation? Any tips for other students?"
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50 transition-colors"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Existing reviews list */}
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No reviews yet for this dish. Be the first to try it!
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev._id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs">
                      {rev.user?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {rev.user?.name || 'Mithibai Student'}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="mt-2 text-sm text-gray-600 pl-12">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customization modal */}
      {food && (
        <CustomizationModal
          item={food}
          isOpen={isCustomizing}
          onClose={() => setIsCustomizing(false)}
        />
      )}
    </div>
  );
};