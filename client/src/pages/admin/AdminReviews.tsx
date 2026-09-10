import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  MapPin,
  Utensils
} from 'lucide-react';
import api from '../../services/api';
import { Review } from '../../types';
import toast from 'react-hot-toast';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/all');
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (review: Review) => {
    try {
      setModeratingId(review._id);
      const newStatus = review.approved !== false ? false : true;
      const res = await api.patch(`/reviews/${review._id}/moderate`, { approved: newStatus });
      toast.success(newStatus ? 'Review approved & made visible' : 'Review hidden from menu');
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, approved: res.data.data.approved } : r))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setModeratingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const dishName = typeof r.foodItem === 'object' ? r.foodItem?.name : '';
    const userName = r.user?.name || '';
    const comment = r.comment || '';

    const matchesSearch =
      dishName.toLowerCase().includes(search.toLowerCase()) ||
      userName.toLowerCase().includes(search.toLowerCase()) ||
      comment.toLowerCase().includes(search.toLowerCase());

    const isApproved = r.approved !== false;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && isApproved) ||
      (statusFilter === 'hidden' && !isApproved);

    const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter, 10);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const approvedCount = reviews.filter((r) => r.approved !== false).length;
  const hiddenCount = reviews.length - approvedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Reviews & Ratings</h1>
        <p className="text-sm text-gray-500">
          Monitor culinary feedback, moderate offensive comments, and inspect dish ratings
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{reviews.length}</h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Star className="h-6 w-6 fill-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campus Avg Rating</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{avgRating} / 5.0</h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Approved & Live</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{approvedCount}</h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Moderated / Hidden</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{hiddenCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by dish name, student name, or review keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none bg-white"
          >
            <option value="all">All Moderation Status</option>
            <option value="approved">Approved / Live Only</option>
            <option value="hidden">Hidden Only</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none bg-white"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading student reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center border border-gray-100 text-gray-400">
            No reviews match the current filters.
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isApproved = rev.approved !== false;
            const foodName = typeof rev.foodItem === 'object' ? rev.foodItem?.name : 'Dish';
            return (
              <div
                key={rev._id}
                className={`rounded-2xl bg-white p-5 border transition-all ${
                  isApproved
                    ? 'border-gray-100 shadow-sm'
                    : 'border-rose-100 bg-rose-50/20 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
                      {rev.user?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{rev.user?.name || 'Student'}</span>
                        <span className="text-xs text-gray-400">({rev.user?.email || 'N/A'})</span>
                      </div>
                      <div className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Utensils className="h-3 w-3" />
                        Reviewed: <span className="font-bold text-gray-900">{foodName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => handleModerate(rev)}
                      disabled={moderatingId === rev._id}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Approved
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Hidden
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {rev.comment && (
                  <p className="mt-3 text-sm text-gray-700 bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                    "{rev.comment}"
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                  <span>
                    Posted on {new Date(rev.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!isApproved && (
                    <span className="text-rose-600 font-semibold">
                      Hidden from student menu view
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};