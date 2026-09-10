import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Store,
  Users,
  ChefHat,
  QrCode,
  Star,
  LogOut,
  ArrowLeft,
  Package,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Analytics & Trends', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Live Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Food Menu Items', path: '/admin/food', icon: UtensilsCrossed },
    { label: 'Inventory Stock', path: '/admin/inventory', icon: Package },
    { label: 'Campus Canteens', path: '/admin/canteens', icon: Store },
    { label: 'Students & Users', path: '/admin/users', icon: Users },
    { label: 'Counter QR Codes', path: '/admin/qr', icon: QrCode },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between flex-shrink-0 min-h-screen sticky top-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white font-black text-lg flex items-center justify-center shadow-lg">
              M
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                Mithibai Eats
              </h1>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                Admin Control Center
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/canteens"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white font-semibold px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student App
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-400">Campus Admin</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};