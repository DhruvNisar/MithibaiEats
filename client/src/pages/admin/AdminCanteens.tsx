import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Canteen } from '../../types';
import toast from 'react-hot-toast';
import { Store, Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';

export const AdminCanteens: React.FC = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCanteens();
  }, []);

  const handleToggleOpen = async (canteen: Canteen) => {
    try {
      const res = await api.put(`/canteens/${canteen._id}`, {
        isOpen: !canteen.isOpen,
      });
      if (res.data.success) {
        toast.success(`${canteen.name} is now ${!canteen.isOpen ? 'OPEN' : 'CLOSED'}`);
        setCanteens((prev) =>
          prev.map((c) => (c._id === canteen._id ? { ...c, isOpen: !canteen.isOpen } : c))
        );
      }
    } catch (err) {
      toast.error('Failed to update canteen status.');
    }
  };

  const handleUpdatePrepTime = async (canteen: Canteen, delta: number) => {
    const newTime = Math.max(5, canteen.avgPrepTime + delta);
    try {
      const res = await api.put(`/canteens/${canteen._id}`, {
        avgPrepTime: newTime,
      });
      if (res.data.success) {
        setCanteens((prev) =>
          prev.map((c) => (c._id === canteen._id ? { ...c, avgPrepTime: newTime } : c))
        );
      }
    } catch {
      toast.error('Failed to update prep time.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold">Loading canteens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Store className="w-6 h-6 text-orange-600" />
          Campus Canteens Management
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure operating hours, average prep times, and open/closed states
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {canteens.map((canteen) => (
          <div
            key={canteen._id}
            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="h-40 rounded-2xl overflow-hidden bg-gray-100 mb-4 relative">
                <img
                  src={canteen.image}
                  alt={canteen.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/food/canteen-ground.svg';
                  }}
                />
                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg">
                  {canteen.floor}
                </span>
                <span
                  className={`absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    canteen.isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {canteen.isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>

              <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{canteen.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{canteen.description}</p>

              <div className="mt-4 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Timings: <b>{canteen.openingTime} - {canteen.closingTime}</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{canteen.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              {/* Prep Time Adjuster */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Avg Wait Time:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdatePrepTime(canteen, -2)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-gray-900">~{canteen.avgPrepTime}m</span>
                  <button
                    onClick={() => handleUpdatePrepTime(canteen, 2)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleToggleOpen(canteen)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  canteen.isOpen
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {canteen.isOpen ? 'Mark Canteen as Closed' : 'Re-Open Canteen'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};