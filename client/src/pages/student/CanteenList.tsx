import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Canteen } from '../../types';
import { Clock, MapPin, Sparkles, ArrowRight, Utensils } from 'lucide-react';

export const CanteenList: React.FC = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        const res = await api.get('/canteens');
        if (res.data.success) {
          setCanteens(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load canteens:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCanteens();
  }, []);

  const canteenHighlights: Record<string, { badge: string; color: string; specialties: string[] }> = {
    ground: {
      badge: 'Street Food & Fresh Juices',
      color: 'from-amber-500 to-orange-600',
      specialties: ['Mithibai Vada Pav', 'Mumbai Sev Puri', 'Mysore Masala Dosa', 'Fresh Mosambi Juice', 'Chikoo Shake'],
    },
    '6th': {
      badge: 'Thalis, Meals & Indo-Chinese',
      color: 'from-orange-600 to-red-600',
      specialties: ['Deluxe Punjabi Thali', 'Triple Schezwan Rice', 'Cheese Maggi', 'Mumbai Pav Bhaji', 'Alfredo Pasta'],
    },
    '8th': {
      badge: 'Rooftop Cafe & Jain Specialties',
      color: 'from-emerald-600 to-teal-700',
      specialties: ['Artisan Bakery & Croissants', 'Gourmet Paninis', 'Pure Jain Counter', 'Cold Caramel Frappe', 'Belgian Waffles'],
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase inline-block">
            SVKM Campus Pickup Only
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Order From 3 Campus Canteens
          </h1>
          <p className="text-orange-100 text-sm max-w-xl">
            Choose your floor, browse over 450 unique college dishes, order ahead, and pick up fresh at the counter without waiting in line.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex-shrink-0">
          <div className="text-2xl font-black">460+</div>
          <div className="text-xs text-orange-100 uppercase tracking-wider font-semibold">Total Campus Items</div>
        </div>
      </div>

      {/* Canteens Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {canteens.map((canteen) => {
            const highlight = canteenHighlights[canteen.slug] || {
              badge: 'Campus Kitchen',
              color: 'from-orange-500 to-amber-600',
              specialties: [],
            };

            return (
              <div
                key={canteen._id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image with overlay tags */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={canteen.image}
                      alt={canteen.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/food/canteen-ground.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    {/* Floor Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      {canteen.floor}
                    </div>

                    {/* Prep Time */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      ~{canteen.avgPrepTime}m wait
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r ${highlight.color} mb-1 shadow`}>
                        {highlight.badge}
                      </span>
                      <h2 className="text-xl font-black leading-tight drop-shadow-sm">
                        {canteen.name}
                      </h2>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <p className="text-gray-600 text-xs leading-relaxed mb-4">
                      {canteen.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 py-2 border-y border-gray-100 mb-4">
                      <span>Timings: <b className="text-gray-700">{canteen.openingTime} - {canteen.closingTime}</b></span>
                      <span className="flex items-center gap-1 text-orange-600 font-bold">
                        <Utensils className="w-3.5 h-3.5" />
                        {canteen.totalItems || 150} Items
                      </span>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                        Popular Specialties
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {highlight.specialties.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-lg"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="p-6 pt-0">
                  <Link
                    to={`/canteen/${canteen._id}`}
                    className="w-full py-3.5 px-4 bg-gray-900 hover:bg-orange-600 text-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-md group-hover:shadow-orange-500/20"
                  >
                    <span>Browse {canteen.name}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};