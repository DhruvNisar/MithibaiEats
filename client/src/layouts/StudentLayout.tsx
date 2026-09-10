import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { CartDrawer } from '../components/cart/CartDrawer';
import { AIAssistantDrawer } from '../components/ai/AIAssistantDrawer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Sparkles,
  Heart,
  Clock,
  User as UserIcon,
  Store,
  LogIn,
  LogOut,
  QrCode,
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const { cart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 transition shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition">
                M
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-gray-900 leading-tight">
                  Mithibai <span className="text-orange-600">Eats</span>
                </span>
                <span className="text-[10px] text-gray-600 font-semibold tracking-wider uppercase">
                  SVKM Campus Food
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/canteens"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  location.pathname === '/canteens'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                Canteens
              </Link>
              <Link
                to="/orders"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  location.pathname === '/orders'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                My Orders
              </Link>
              <Link
                to="/favorites"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  location.pathname === '/favorites'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                Favorites
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAIOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-orange-200/80 text-orange-700 text-xs font-bold transition shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition flex items-center justify-center"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition"
                  title="Your Profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:inline text-xs font-bold text-gray-800 truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-[11px] bg-purple-50 text-purple-600 font-bold px-2 py-1 rounded-lg border border-purple-200"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
              M
            </div>
            <span className="font-bold text-gray-700">Mithibai Eats • SVKM Campus Canteens</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/canteens" className="hover:text-orange-600">3 Canteens</Link>
            <Link to="/order" className="hover:text-orange-600 flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> Table QR</Link>
            <Link to="/login" className="hover:text-orange-600">Admin Login</Link>
          </div>
          <p>© 2026 SVKM Mithibai College • Pickup Only Platform</p>
        </div>
      </footer>

      {/* Floating AI Assistant FAB */}
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:to-amber-700 text-white rounded-full shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/40"
        aria-label="Open AI Food Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-black tracking-wide hidden sm:inline">Ask Foodie AI</span>
      </button>

      {/* Modals & Drawers */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
};