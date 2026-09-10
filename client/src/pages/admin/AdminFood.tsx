import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FoodItem } from '../../types';
import toast from 'react-hot-toast';
import {
  Search,
  Sparkles,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

export const AdminFood: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [canteenFilter, setCanteenFilter] = useState('all');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<FoodItem | null>(null);

  const fetchItems = async () => {
    try {
      const res = await api.get('/food?limit=500');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load food items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleStock = async (item: FoodItem) => {
    try {
      const newStatus = !item.available;
      const res = await api.patch(`/food/${item._id}/stock`, {
        available: newStatus,
        stock: newStatus ? (item.stock === 0 ? 50 : item.stock) : 0,
      });
      if (res.data.success) {
        toast.success(`Updated ${item.name} availability.`);
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, available: newStatus } : i))
        );
      }
    } catch (err) {
      toast.error('Failed to update stock status.');
    }
  };

  const handleRegenerateImage = async (item: FoodItem) => {
    try {
      setRegeneratingId(item._id);
      const res = await api.post(`/admin/food/${item._id}/regenerate-image`);
      if (res.data.success) {
        toast.success(`AI image regenerated for ${item.name}!`);
        const updatedImageUrl = `${res.data.data.imageUrl}?t=${Date.now()}`;
        setItems((prev) =>
          prev.map((i) =>
            i._id === item._id
              ? { ...i, imageUrl: updatedImageUrl, image: updatedImageUrl, isAiGenerated: true }
              : i
          )
        );
        if (previewItem && previewItem._id === item._id) {
          setPreviewItem({ ...previewItem, imageUrl: updatedImageUrl, image: updatedImageUrl });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to regenerate image.');
    } finally {
      setRegeneratingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (canteenFilter !== 'all') {
      const slug = (item.canteen as any)?.slug || '';
      if (slug !== canteenFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Food Menu & AI Image Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Displaying {filteredItems.length} curated dishes across Mithibai Canteens with individual AI image controls.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search dish by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={canteenFilter}
          onChange={(e) => setCanteenFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Canteens (Ground, 6th, 8th)</option>
          <option value="ground">Ground Floor Canteen</option>
          <option value="6th">6th Floor Canteen</option>
          <option value="8th">8th Floor Canteen</option>
        </select>
      </div>

      {/* Food Items Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Dish & AI Image</th>
                <th className="p-4">Image Status</th>
                <th className="p-4">Canteen</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredItems.slice(0, 100).map((item) => {
                const imgSource = item.imageUrl || item.image || '/food/placeholder.webp';
                const isRegenerating = regeneratingId === item._id;

                return (
                  <tr key={item._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div
                        onClick={() => setPreviewItem(item)}
                        className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer group shadow-xs border border-gray-200/60"
                      >
                        <img
                          src={imgSource}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/food/placeholder.webp';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 leading-tight">{item.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {item.vegetarian ? '🥦 Veg' : '🍗 Non-Veg'}{' '}
                          {item.jainAvailable && '• 🌿 Jain Option'}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        ✓ AI Generated
                      </span>
                    </td>

                    <td className="p-4 text-gray-800">
                      {(item.canteen as any)?.name || 'Canteen'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {(item.category as any)?.name || 'General'}
                    </td>
                    <td className="p-4 font-black text-gray-900 text-sm">₹{item.price}</td>
                    <td className="p-4 font-semibold">{item.stock}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRegenerateImage(item)}
                          disabled={isRegenerating}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                            isRegenerating
                              ? 'bg-orange-50 text-orange-400 border-orange-200 cursor-not-allowed'
                              : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50 shadow-xs'
                          }`}
                          title="Generate a new AI image for this dish"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-orange-500' : ''}`} />
                          <span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
                        </button>

                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                          title="Preview full image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStock(item)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                            item.available
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {item.available ? 'Sold Out' : 'In Stock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="relative h-72 bg-gray-900">
              <img
                src={previewItem.imageUrl || previewItem.image || '/food/placeholder.webp'}
                alt={previewItem.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/food/placeholder.webp';
                }}
              />
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur shadow">
                  <Sparkles className="w-3 h-3" />
                  ✓ AI Generated Asset
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{previewItem.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{previewItem.description}</p>
                </div>
                <div className="text-xl font-black text-orange-600">₹{previewItem.price}</div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1">
                <div><span className="font-bold text-gray-700">Image URL:</span> <code className="text-orange-600">{previewItem.imageUrl || previewItem.image}</code></div>
                <div><span className="font-bold text-gray-700">Format:</span> Optimized WebP (800×600)</div>
                <div><span className="font-bold text-gray-700">Storage:</span> Local CDN (Offline & Campus Ready)</div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRegenerateImage(previewItem)}
                  disabled={regeneratingId === previewItem._id}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-600 text-white hover:bg-orange-700 transition shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === previewItem._id ? 'animate-spin' : ''}`} />
                  <span>{regeneratingId === previewItem._id ? 'Generating...' : 'Regenerate AI Image'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
