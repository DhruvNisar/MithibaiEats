import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Order } from '../../types';
import { Download, Search, Filter, Clock, CheckCircle2, ChevronRight, Truck, MapPin, Building2 } from 'lucide-react';
import { connectSocket } from '../../services/socketService';
import toast from 'react-hot-toast';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?limit=100');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = connectSocket();
    socket.emit('join:room', { room: 'admin:orders' });

    const handleUpdate = () => {
      fetchOrders();
    };

    socket.on('order:created', handleUpdate);
    socket.on('order:confirmed', handleUpdate);
    socket.on('order:accepted', handleUpdate);
    socket.on('order:preparing', handleUpdate);
    socket.on('order:ready', handleUpdate);
    socket.on('order:completed', handleUpdate);
    socket.on('order:cancelled', handleUpdate);

    return () => {
      socket.off('order:created', handleUpdate);
      socket.off('order:confirmed', handleUpdate);
      socket.off('order:accepted', handleUpdate);
      socket.off('order:preparing', handleUpdate);
      socket.off('order:ready', handleUpdate);
      socket.off('order:completed', handleUpdate);
      socket.off('order:cancelled', handleUpdate);
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/export/orders', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mithibai-orders.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export orders CSV:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchUser = ((o.user as any)?.name || '').toLowerCase().includes(q);
      if (!matchNum && !matchUser) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time view of all campus orders</p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Orders CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or student name..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Order & Token</th>
                <th className="p-4">Type</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Canteen</th>
                <th className="p-4">Dishes</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status & Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50/60 transition">
                  <td className="p-4">
                    <div className="font-mono font-bold text-gray-900 text-sm">#{o.orderNumber}</div>
                    <div className="text-[11px] text-gray-400">
                      Token: <b className="text-orange-600 font-mono">{o.pickupToken || o.pickupCode || 'N/A'}</b>
                    </div>
                  </td>

                  {/* Fulfillment Type */}
                  <td className="p-4">
                    {o.fulfillmentType === 'delivery' ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-2 max-w-[160px]">
                        <span className="flex items-center gap-1 font-black text-orange-800 text-[11px]">
                          <Truck className="w-3.5 h-3.5 text-orange-600" /> Delivery
                        </span>
                        <div className="text-[10px] text-gray-700 font-bold truncate mt-0.5" title={o.deliveryDetails?.floorRoom}>
                          {o.deliveryDetails?.floorRoom || 'Campus Delivery'}
                        </div>
                        <div className="text-[9px] text-gray-400 truncate">
                          {o.deliveryDetails?.building || 'Main Building'}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 max-w-[160px]">
                        <span className="flex items-center gap-1 font-black text-slate-800 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" /> Self Pickup
                        </span>
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">Counter Pickup</div>
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-gray-900">{(o.user as any)?.name || 'Student'}</div>
                    <div className="text-[11px] text-gray-400">{(o.user as any)?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{o.canteen?.name}</div>
                    <div className="text-[11px] text-gray-400">{o.canteen?.floor}</div>
                  </td>
                  <td className="p-4">
                    <div className="line-clamp-2 max-w-xs text-[11px]">
                      {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="uppercase font-bold text-[10px] bg-gray-100 px-2 py-0.5 rounded">
                      {o.paymentMethod}
                    </span>
                    <div className="text-[10px] text-gray-400 capitalize mt-0.5">{o.paymentStatus}</div>
                  </td>
                  <td className="p-4 font-black text-gray-900 text-sm">₹{o.total}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          o.orderStatus === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : o.orderStatus === 'ready'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : o.orderStatus === 'preparing'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {o.orderStatus}
                      </span>

                      {/* Quick Status Action Buttons */}
                      {o.orderStatus === 'placed' && (
                        <button
                          onClick={() => updateStatus(o._id, 'accepted')}
                          className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded transition"
                        >
                          Accept
                        </button>
                      )}
                      {o.orderStatus === 'accepted' && (
                        <button
                          onClick={() => updateStatus(o._id, 'preparing')}
                          className="text-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold px-2 py-0.5 rounded transition"
                        >
                          Start Prep
                        </button>
                      )}
                      {o.orderStatus === 'preparing' && (
                        <button
                          onClick={() => updateStatus(o._id, 'ready')}
                          className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 rounded transition"
                        >
                          Mark Ready
                        </button>
                      )}
                      {o.orderStatus === 'ready' && (
                        <button
                          onClick={() => updateStatus(o._id, 'completed')}
                          className="text-[10px] bg-green-600 hover:bg-green-700 text-white font-bold px-2 py-0.5 rounded transition"
                        >
                          Complete
                        </button>
                      )}
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