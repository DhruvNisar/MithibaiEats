import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FoodItem } from '../../types';
import { Download, Search, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchItems = async () => {
    try {
      const res = await api.get('/food?limit=500');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/export/inventory', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mithibai-inventory.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export inventory CSV:', err);
    }
  };

  const handleUpdateStock = async (item: FoodItem, newStock: number) => {
    try {
      const res = await api.patch(`/food/${item._id}/stock`, {
        stock: newStock,
        available: newStock > 0,
      });
      if (res.data.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, stock: newStock, available: newStock > 0 } : i))
        );
        toast.success(`Updated stock for ${item.name}`);
      }
    } catch {
      toast.error('Failed to update stock.');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = items.filter((i) => i.stock <= 10).length;

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" />
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time kitchen stock across all canteens
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Inventory CSV
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Items</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{items.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase">Available</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {items.filter((i) => i.available).length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock / Sold Out
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish name..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Canteen</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Quantity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredItems.slice(0, 100).map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/60 transition">
                  <td className="p-4 font-bold text-gray-900">{item.name}</td>
                  <td className="p-4 text-gray-600">{(item.canteen as any)?.name}</td>
                  <td className="p-4 font-black">₹{item.price}</td>
                  <td className="p-4">
                    <span className={`font-bold ${item.stock <= 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {item.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateStock(item, Math.max(0, item.stock - 10))}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-bold text-xs"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleUpdateStock(item, item.stock + 10)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-bold text-xs"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleUpdateStock(item, 50)}
                        className="px-2 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded font-bold text-xs ml-1"
                      >
                        Reset (50)
                      </button>
                    </div>
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