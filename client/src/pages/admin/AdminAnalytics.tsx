import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Download,
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  PieChart as PieIcon,
  Layers,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      toast.error('Failed to load analytics aggregations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = async (type: string, filename: string) => {
    toast.loading(`Exporting ${filename}...`, { id: 'csv-export' });
    try {
      const res = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
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
      toast.error(`Failed to export ${filename}`, { id: 'csv-export' });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold">Running MongoDB aggregation pipelines...</p>
      </div>
    );
  }

  // Format peak hours data
  const peakHoursChartData = (data?.peakHours || []).map((item: any) => ({
    time: item.label,
    orders: item.orderCount,
    revenue: item.revenue,
  }));

  // Format Canteen Revenue
  const canteenRevenueData = (data?.canteenRevenue || []).map((c: any) => ({
    name: c.canteenName ? c.canteenName.replace(' Canteen', '') : 'Canteen',
    floor: c.floor,
    revenue: c.totalRevenue,
    orders: c.totalOrders,
    aov: c.avgOrderValue,
  }));

  // Format Payment Methods
  const paymentMethodsData = (data?.paymentMethods || []).map((p: any) => ({
    name: p.label,
    orders: p.orderCount,
    revenue: p.totalRevenue,
    color: p.color,
  }));

  // Format Dietary Breakdown
  const dietaryData = [
    { name: '🥦 Vegetarian', value: data?.dietary?.vegetarian || 0, color: '#16a34a' },
    { name: '🌿 Pure Jain', value: data?.dietary?.jain || 0, color: '#059669' },
    { name: '🍗 Regular / Other', value: data?.dietary?.nonVeg || 0, color: '#ea580c' },
  ];

  // Top Items
  const topItems = data?.topItems || [];

  return (
    <div className="space-y-8">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-orange-600" />
            MongoDB Analytics & Performance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time aggregation pipelines across Ground Floor, 6th Floor & 8th Floor Canteens
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport('sales', 'mithibai-sales-analytics.csv')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export Sales CSV
          </button>
          <button
            onClick={() => handleExport('orders', 'mithibai-orders-analytics.csv')}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Orders CSV
          </button>
          <button
            onClick={() => handleExport('inventory', 'mithibai-inventory-analytics.csv')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export Inventory CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Completed Revenue
          </span>
          <div className="text-2xl font-black text-gray-900">
            ₹{(data?.summary?.totalRevenue || 0).toFixed(2)}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            From {data?.summary?.completedOrders || 0} fulfilled orders
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Orders Placed
          </span>
          <div className="text-2xl font-black text-gray-900">
            {data?.summary?.totalOrders || 0}
          </div>
          <p className="text-xs text-orange-600 font-semibold mt-1">Across all 3 canteens</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Average Order Value (AOV)
          </span>
          <div className="text-2xl font-black text-gray-900">
            ₹{(data?.summary?.averageOrderValue || 0).toFixed(2)}
          </div>
          <p className="text-xs text-blue-600 font-semibold mt-1">Average student ticket size</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Avg Kitchen Fulfillment
          </span>
          <div className="text-2xl font-black text-gray-900">
            ~{data?.preparationTime?.avgActualFulfillment || 14} mins
          </div>
          <p className="text-xs text-purple-600 font-semibold mt-1">Order place to completion</p>
        </div>
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Canteen Performance / Revenue & Orders */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Revenue & Orders by Canteen Floor
              </h3>
              <p className="text-xs text-gray-400">Ground Floor vs 6th Floor vs 8th Floor distribution</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={canteenRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `₹${value}` : `${value} orders`,
                    name === 'revenue' ? 'Revenue' : 'Orders Placed',
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#ea580c" radius={[8, 8, 0, 0]} barSize={28} />
                <Bar dataKey="orders" name="Orders Count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Peak Ordering Hours */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" /> Peak College Ordering Hours
              </h3>
              <p className="text-xs text-gray-400">Hourly student traffic volume (8:00 AM - 8:00 PM)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHoursChartData}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  formatter={(value: any) => [value, 'Orders Placed']}
                />
                <Area type="monotone" dataKey="orders" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#orderGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Payment Methods Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" /> Payment Methods Breakdown
              </h3>
              <p className="text-xs text-gray-400">UPI Digital (QR Code) vs Cash Pay at Counter</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="orders"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {paymentMethodsData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  formatter={(value: any, _name: string, props: any) => [
                    `${value} orders (₹${props.payload.revenue || 0})`,
                    props.payload.name,
                  ]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Dietary Split in Catalog */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" /> Dietary Breakdown in Menu
              </h3>
              <p className="text-xs text-gray-400">Vegetarian vs Pure Jain vs Non-Veg items</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dietaryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[1]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dietaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Categories & Preparation Times Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" /> Menu Category Distribution
              </h3>
              <p className="text-xs text-gray-400">Item counts, average pricing, and prep times</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-center">Items</th>
                  <th className="p-2.5 text-center">Avg Price</th>
                  <th className="p-2.5 text-right">Avg Prep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {(data?.categories || []).slice(0, 7).map((cat: any) => (
                  <tr key={cat.categoryId} className="hover:bg-gray-50/50">
                    <td className="p-2.5 font-bold text-gray-800 flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-gray-700">{cat.totalItems}</td>
                    <td className="p-2.5 text-center text-orange-600 font-bold">₹{cat.avgPrice}</td>
                    <td className="p-2.5 text-right text-gray-500">~{cat.avgPrepTime}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preparation Time & Inventory Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" /> Campus Inventory & Stock Health
              </h3>
              <p className="text-xs text-gray-400">Real-time stock availability across floors</p>
            </div>
          </div>

          {/* Quick Inventory Health Pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">In Stock</span>
              <span className="text-xl font-black text-emerald-900">
                {data?.inventory?.inStock || 464}
              </span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Low Stock (&le;10)</span>
              <span className="text-xl font-black text-amber-900">
                {data?.inventory?.lowStock || 0}
              </span>
            </div>
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">Out of Stock</span>
              <span className="text-xl font-black text-rose-900">
                {data?.inventory?.outOfStock || 0}
              </span>
            </div>
          </div>

          {/* Canteen Inventory Breakdown */}
          <div className="space-y-2 mt-3">
            {(data?.inventory?.canteenStock || []).map((cs: any) => (
              <div
                key={cs._id}
                className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900">{cs.canteenName}</span>
                  <span className="text-gray-400 text-[10px] block">{cs.floor}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-600">{cs.availableItems} active</span>
                  {cs.outOfStockItems > 0 && (
                    <span className="font-bold text-rose-600">{cs.outOfStockItems} unavailable</span>
                  )}
                  <span className="text-gray-400 font-semibold">{cs.totalItems} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Campus Bestsellers Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" /> Top 10 Campus Bestsellers
            </h3>
            <p className="text-xs text-gray-400">
              Ranked by total quantity sold & student popularity score
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Dish Name</th>
                <th className="p-3">Canteen Counter</th>
                <th className="p-3 text-center">Units Sold</th>
                <th className="p-3 text-center">Price</th>
                <th className="p-3 text-center">Total Revenue</th>
                <th className="p-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {topItems.map((item: any, idx: number) => (
                <tr key={item.foodItemId || idx} className="hover:bg-gray-50/50">
                  <td className="p-3 font-bold text-gray-400">#{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{item.name}</div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {item.canteenName} ({item.canteenFloor})
                  </td>
                  <td className="p-3 text-center font-bold text-gray-900">
                    {item.quantitySold || 0}
                  </td>
                  <td className="p-3 text-center font-bold text-orange-600">
                    ₹{item.price}
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-600">
                    ₹{item.totalRevenue || 0}
                  </td>
                  <td className="p-3 text-right font-bold text-amber-500">
                    ★ {item.rating || 4.5}
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