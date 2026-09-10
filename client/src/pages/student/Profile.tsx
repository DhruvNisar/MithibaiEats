import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  User as UserIcon,
  Sparkles,
  ShoppingBag,
  IndianRupee,
  Shield,
  Save,
  LogOut,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [vegetarian, setVegetarian] = useState(user?.preferences?.vegetarian || false);
  const [jain, setJain] = useState(user?.preferences?.jain || false);
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'spicy'>(
    user?.preferences?.spiceLevel || 'medium'
  );
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        preferences: { vegetarian, jain, spiceLevel },
      });
      if (res.data.success) {
        updateUser({
          name,
          phone,
          preferences: { vegetarian, jain, spiceLevel },
        });
        toast.success('Profile preferences updated!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Student Profile</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage preferences & campus ordering stats</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total Orders</span>
            <div className="text-xl font-black text-gray-900">{user.totalOrders || 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Campus Spent</span>
            <div className="text-xl font-black text-gray-900">₹{(user.totalSpent || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Account Role</span>
            <div className="text-xl font-black text-gray-900 capitalize">{user.role}</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                College Email
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full text-xs p-3.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98200 12345"
              className="w-full text-xs p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Dietary Preferences */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <span className="block text-xs font-black text-gray-400 uppercase tracking-wider">
              Food & Diet Preferences
            </span>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vegetarian}
                  onChange={(e) => setVegetarian(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                />
                <span>🥦 Vegetarian Only</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jain}
                  onChange={(e) => {
                    setJain(e.target.checked);
                    if (e.target.checked) setVegetarian(true);
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1 text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5" /> Pure Jain Preparation (No root vegetables)
                </span>
              </label>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Spice Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {(['mild', 'medium', 'spicy'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSpiceLevel(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition capitalize ${
                      spiceLevel === lvl
                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 p-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-xs"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};