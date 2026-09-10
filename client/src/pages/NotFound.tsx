import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Store, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 shadow-md animate-bounce">
        <UtensilsCrossed className="w-10 h-10" />
      </div>

      <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200 mb-3 inline-block">
        Error 404 • Dish Not Found
      </span>

      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-3">
        Oops! You seem lost on campus
      </h1>

      <p className="text-gray-500 text-sm max-w-md mb-8">
        The floor, counter, or page you are looking for does not exist or has moved. Let us get you back to the menus!
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/canteens"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs shadow-md transition"
        >
          <Store className="w-4 h-4" />
          Browse 3 Campus Canteens
        </Link>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-2xl font-bold text-xs transition"
        >
          <Home className="w-4 h-4" />
          Campus Home
        </Link>
      </div>
    </div>
  );
};
