import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  CreditCard, 
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

interface ExtendedUser extends User {
  isActive?: boolean;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: ExtendedUser) => {
    try {
      setTogglingId(user._id);
      const res = await api.patch(`/admin/users/${user._id}/toggle`);
      toast.success(res.data.message || 'User status updated');
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: res.data.data.isActive } : u))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalSpent = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
  const studentCount = users.filter((u) => u.role === 'student').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">
          View registered students, kitchen staff, and administrators across Mithibai Eats
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Accounts</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{users.length}</h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Students</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{studentCount}</h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-extrabold text-gray-900">
              {users.filter((u) => u.isActive !== false).length}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total User Volume</p>
            <h3 className="text-2xl font-extrabold text-gray-900">₹{totalSpent.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="staff">Canteen Staff</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Dietary Preference</th>
                <th className="py-3.5 px-6">Orders Placed</th>
                <th className="py-3.5 px-6">Total Spent</th>
                <th className="py-3.5 px-6">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading users list...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No users match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${
                            u.role === 'admin'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs">
                          {u.preferences?.jain ? (
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                              Jain
                            </span>
                          ) : u.preferences?.vegetarian ? (
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                              Veg
                            </span>
                          ) : (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">
                              Regular
                            </span>
                          )}
                          <span className="text-gray-400">({u.preferences?.spiceLevel || 'medium'})</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {u.totalOrders || 0}
                      </td>
                      <td className="py-4 px-6 font-bold text-amber-600">
                        ₹{(u.totalSpent || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={togglingId === u._id || u.role === 'admin'}
                          title={u.role === 'admin' ? 'Cannot disable admin' : 'Toggle access'}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-rose-600" /> Suspended
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};