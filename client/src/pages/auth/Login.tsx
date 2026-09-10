import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LogIn, UserCheck, ShieldCheck, ChefHat, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        toast.success(`Welcome back, ${user.name}!`);

        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'staff') {
          navigate('/staff');
        } else {
          navigate('/canteens');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg mb-3">
          M
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Sign In to Mithibai Eats
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          SVKM Mithibai College Campus Pickup
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          {/* Quick Demo Login Switcher */}
          <div className="mb-6 p-4 bg-orange-50/70 border border-orange-200 rounded-2xl">
            <div className="text-xs font-black text-orange-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" /> One-Click Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setDemoCredentials('student@mithibai.ac.in', 'student123')}
                className="text-[11px] p-2 bg-white hover:bg-orange-100/70 rounded-xl border border-orange-200 font-bold text-gray-800 text-left flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('priya.jain@mithibai.ac.in', 'student123')}
                className="text-[11px] p-2 bg-white hover:bg-emerald-100/70 rounded-xl border border-emerald-200 font-bold text-gray-800 text-left flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Jain Student
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('staff.ground@mithibai.ac.in', 'staff123')}
                className="text-[11px] p-2 bg-white hover:bg-blue-100/70 rounded-xl border border-blue-200 font-bold text-gray-800 text-left flex items-center gap-1.5 transition"
              >
                <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                Ground Staff
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('staff.6th@mithibai.ac.in', 'staff123')}
                className="text-[11px] p-2 bg-white hover:bg-blue-100/70 rounded-xl border border-blue-200 font-bold text-gray-800 text-left flex items-center gap-1.5 transition"
              >
                <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                6th Floor Staff
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('staff.8th@mithibai.ac.in', 'staff123')}
                className="text-[11px] p-2 bg-white hover:bg-blue-100/70 rounded-xl border border-blue-200 font-bold text-gray-800 text-left flex items-center gap-1.5 transition"
              >
                <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                8th Floor Staff
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@mithibai.ac.in', 'admin123')}
                className="text-[11px] p-2 bg-white hover:bg-purple-100/70 rounded-xl border border-purple-200 font-bold text-gray-800 text-left flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                College Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                College Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@mithibai.ac.in"
                className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">
              Register Student ID
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};