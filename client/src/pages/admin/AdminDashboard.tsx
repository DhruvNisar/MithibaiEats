import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Utensils,
  Download,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = async (endpoint: string, filename: string) => {
    toast.loading(`Exporting ${filename}...`, { id: 'csv-export' });
    try {
      const res = await api.get(`/admin/export/${endpoint}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${filename}!`, { id: 'csv-export' });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export CSV file', { id: 'csv-export' });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold">Loading campus admin metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & CSV Exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Campus Operations Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            SVKM Mithibai College • Ground Floor, 6th Floor & 8th Floor Canteens
          </p>
        </div>

        {/* CSV Export Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport('orders', 'mithibai-orders.csv')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            Orders CSV
          </button>
          <button
            onClick={() => handleExport('sales', 'mithibai-sales.csv')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Sales CSV
          </button>
          <button
            onClick={() => handleExport('inventory', 'mithibai-inventory.csv')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Inventory CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue & Today */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">
            ₹{(stats?.totalRevenue || 0).toFixed(2)}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> ₹{(stats?.todayRevenue || 0).toFixed(2)} today
          </div>
        </div>

        {/* Total Orders & Today */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{stats?.totalOrders || 0}</div>
          <div className="text-xs text-orange-600 font-semibold mt-1">
            {stats?.todayOrders || 0} placed today
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Avg Order Value (AOV)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">
            ₹{(stats?.averageOrderValue || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-1">
            Across {stats?.completedOrdersCount || 0} completed orders
          </div>
        </div>

        {/* Inventory & Active Items */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Catalog
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">{stats?.totalFoodItems || 464}</div>
          <div className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600">● {stats?.inventory?.inStock || 464} In Stock</span>
            {stats?.inventory?.outOfStock > 0 && (
              <span className="text-rose-600">● {stats?.inventory?.outOfStock} Out</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/analytics"
          className="bg-gradient-to-tr from-orange-600 to-amber-600 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between"
        >
          <div>
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
              Aggregation Engine
            </span>
            <h3 className="text-xl font-black mt-2">MongoDB Analytics & Visuals</h3>
            <p className="text-xs text-orange-100 mt-1">
              Deep dive into revenue by canteen, peak hours, bestselling dishes, and category sales.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold mt-4">
            <span>Open Analytics</span> <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <span className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
              Live Feed
            </span>
            <h3 className="text-xl font-black text-gray-900 mt-2">Campus Kitchen Queue</h3>
            <p className="text-xs text-gray-500 mt-1">
              Monitor live orders across Ground Floor, 6th Floor, and 8th Floor pickup counters.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mt-4">
            <span>View All Orders</span> <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/qr"
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <span className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
              Counter Standees
            </span>
            <h3 className="text-xl font-black text-gray-900 mt-2">Table & Counter QR Codes</h3>
            <p className="text-xs text-gray-500 mt-1">
              Download PNGs or print high-res table standees for Ground, 6th, and 8th floor counters.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mt-4">
            <span>Manage QR Codes</span> <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Recent Campus Orders</h3>
            <p className="text-xs text-gray-400">Real-time incoming student orders from kitchens</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Pickup Token</th>
                <th className="p-3">Student</th>
                <th className="p-3">Canteen Floor</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {(stats?.recentOrders || []).map((o: any) => (
                <tr key={o._id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-mono font-bold text-gray-900">#{o.orderNumber}</td>
                  <td className="p-3 font-mono font-bold text-orange-600">
                    {o.pickupToken || '—'}
                  </td>
                  <td className="p-3 text-gray-700">
                    <div className="font-semibold">{o.user?.name || 'Student'}</div>
                    <div className="text-[10px] text-gray-400">{o.user?.email || ''}</div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {o.canteen?.name} ({o.canteen?.floor})
                  </td>
                  <td className="p-3 font-bold text-gray-900">₹{o.total}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        o.paymentStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : o.paymentStatus === 'failed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {o.paymentMethod || 'cash'} • {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        o.orderStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.orderStatus === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : o.orderStatus === 'preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};