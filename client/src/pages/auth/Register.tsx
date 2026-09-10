import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Sparkles } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vegetarian, setVegetarian] = useState(true);
  const [jain, setJain] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'spicy'>('medium');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        preferences: { vegetarian, jain, spiceLevel },
      });

      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        toast.success(`Welcome to Mithibai Eats, ${user.name}!`);
        navigate('/canteens');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
          M
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Fast college pickup ordering
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Mehta"
                className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aarav@mithibai.ac.in"
                className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Phone Number (for pickup SMS alerts)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Dietary Preferences */}
            <div className="pt-2 border-t border-gray-100">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                Dietary Preferences
              </span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vegetarian}
                    onChange={(e) => setVegetarian(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>🥦 Vegetarian Food Only</span>
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
                    <Sparkles className="w-3.5 h-3.5" /> Pure Jain Preparation (No root veg, onion, garlic)
                  </span>
                </label>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">Default Spice Level</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Student Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};