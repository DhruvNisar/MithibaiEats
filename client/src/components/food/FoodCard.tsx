import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CustomizationModal } from './CustomizationModal';
import { Clock, Star, Flame, Sparkles, Heart } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface FoodCardProps {
  item: FoodItem;
  initialIsFavorite?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, initialIsFavorite = false }) => {
  const { addItem, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [togglingFav, setTogglingFav] = useState(false);
  const quantity = getItemQuantity(item._id);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.customizations && item.customizations.length > 0) {
      setIsModalOpen(true);
    } else {
      addItem(item, 1);
      toast.success(`Added ${item.name} to cart`);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      navigate('/login');
      return;
    }

    try {
      setTogglingFav(true);
      const res = await api.post('/favorites/toggle', { foodItemId: item._id });
      setIsFavorite(res.data.isFavorite);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update favorite');
    } finally {
      setTogglingFav(false);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-2xl border transition duration-200 overflow-hidden flex flex-col justify-between hover:shadow-lg ${
        !item.available ? 'opacity-60 grayscale' : ''
      }`}>
        <div className="relative h-44 overflow-hidden bg-gray-100 group cursor-pointer">
          <Link to={`/food/${item._id}`}>
            <img
              src={item.imageUrl || item.image}
              alt={item.name}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/food/placeholder.webp';
              }}
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {item.vegetarian ? (
              <span className="bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> VEG
              </span>
            ) : (
              <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                NON-VEG
              </span>
            )}
            {item.jainAvailable && (
              <span className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> JAIN OPTION
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={togglingFav}
            aria-label="Toggle favorite"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white transition active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button>

          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{item.rating ? item.rating.toFixed(1) : '4.5'}</span>
            <span className="text-gray-400 text-[10px]">({item.totalReviews || 0})</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <Link
                to={`/food/${item._id}`}
                className="font-bold text-gray-900 text-base leading-snug line-clamp-1 hover:text-orange-600 transition-colors"
              >
                {item.name}
              </Link>
            </div>
            <p className="text-gray-500 text-xs line-clamp-2 mb-3">{item.description}</p>
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <div>
              <div className="text-lg font-black text-gray-900">₹{item.price}</div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-gray-400" /> ~{item.preparationTime}m
                </span>
                {item.spicyLevel !== 'mild' && (
                  <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                    <Flame className="w-3 h-3 fill-amber-500" />
                    {item.spicyLevel}
                  </span>
                )}
              </div>
            </div>

            <div>
              {!item.available ? (
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-md">
                  Sold Out
                </span>
              ) : (
                <button
                  onClick={handleAddClick}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                    quantity > 0
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200'
                  }`}
                >
                  {quantity > 0 ? (
                    <>IN CART ({quantity})</>
                  ) : (
                    <>
                      ADD +
                      {item.customizations && item.customizations.length > 0 && (
                        <span className="text-[10px] opacity-75">• Custom</span>
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CustomizationModal
          item={item}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
