import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FoodCard } from '../../components/food/FoodCard';
import { FoodItem } from '../../types';
import { Heart, ArrowRight } from 'lucide-react';

export const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get('/favorites');
        if (res.data.success) {
          setFavorites(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          Your Favorite Dishes
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Quick access to the meals you love</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No favorites yet</h3>
          <p className="text-xs text-gray-400 mt-1 mb-5">
            Browse menus and bookmark your favorite college dishes for 1-click re-ordering.
          </p>
          <Link
            to="/canteens"
            className="px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition inline-flex items-center gap-2"
          >
            <span>Browse Campus Menus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => {
            if (!fav.foodItem) return null;
            return <FoodCard key={fav._id} item={fav.foodItem as FoodItem} />;
          })}
        </div>
      )}
    </div>
  );
};