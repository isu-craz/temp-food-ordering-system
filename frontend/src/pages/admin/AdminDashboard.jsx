import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import {
  ShieldCheck,
  Users,
  User,
  Search,
  RefreshCw,
  Lock,
  UserPlus,
  MapPin,
  UtensilsCrossed,
  ChefHat,
  Bike,
  MessageSquareWarning,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'BRANCH_MANAGER' | 'RIDER' | 'SUPERVISOR' | 'OPS_MANAGER'

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New User Form State (System Admin cannot be created via UI, only staff roles allowed)
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: 'Password123!',
    role: 'BRANCH_MANAGER',
    phoneNumber: '0770001122',
  });

  const [newPassword, setNewPassword] = useState('NewPass123!');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/admin/users', newUser);
      if (res.success) {
        alert(`Staff account created successfully for ${newUser.fullName}!`);
        setShowAddUserModal(false);
        const createdObj = res.data && res.data.userId ? res.data : {
          userId: Date.now(),
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          status: 'ACTIVE',
          branchName: 'Unassigned',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers((prevUsers) => [createdObj, ...prevUsers.filter(u => u.userId !== createdObj.userId)]);
        setNewUser({ fullName: '', email: '', password: 'Password123!', role: 'BRANCH_MANAGER', phoneNumber: '0770001122' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user account');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;
    try {
      const res = await axiosClient.patch(`/admin/users/${userId}/status?status=${nextStatus}`);
      if (res.success) {
        setUsers(users.map((u) => (u.userId === userId ? { ...u, status: nextStatus } : u)));
      }
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await axiosClient.post(`/admin/users/${selectedUser.userId}/reset-password`, { password: newPassword });
      if (res.success) {
        alert(`Password for ${selectedUser.email} has been reset to: ${newPassword}`);
        setShowResetPasswordModal(false);
      }
    } catch (err) {
      alert('Error resetting password');
    }
  };

  // Filter staff users based on selected role tab & search keyword
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'BRANCH_MANAGER':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'RIDER':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'SUPERVISOR':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'OPS_MANAGER':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'CUSTOMER':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'ADMIN':
        return 'bg-stone-900 text-white border-stone-800';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        badgeIcon={ShieldCheck}
        badgeText="System Administrator Console"
        badgeColor="bg-orange-600/90"
        title="Staff Account Management"
        description="Centralized staff user credentials, role assignments, status toggles, and security password resets."
      >
        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg text-xs flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Add Staff Account
        </button>
        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-2xl border border-stone-700 text-xs flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Sync Staff
        </button>
      </PageHeader>

      {/* Role Filter Tabs Bar */}
      <div className="bg-white border border-stone-200 p-2 rounded-2xl mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            roleFilter === 'ALL' ? 'bg-orange-600 text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" /> All Accounts ({users.length})
        </button>

        <button
          onClick={() => setRoleFilter('CUSTOMER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            roleFilter === 'CUSTOMER' ? 'bg-orange-600 text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <User className="w-4 h-4" /> Customers ({users.filter((u) => u.role === 'CUSTOMER').length})
        </button>

        <button
          onClick={() => setRoleFilter('BRANCH_MANAGER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            roleFilter === 'BRANCH_MANAGER' ? 'bg-orange-600 text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ChefHat className="w-4 h-4" /> Branch Managers ({users.filter((u) => u.role === 'BRANCH_MANAGER').length})
        </button>

        <button
          onClick={() => setRoleFilter('RIDER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            roleFilter === 'RIDER' ? 'bg-orange-600 text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Bike className="w-4 h-4" /> Delivery Riders ({users.filter((u) => u.role === 'RIDER').length})
        </button>

        <button
          onClick={() => setRoleFilter('SUPERVISOR')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            roleFilter === 'SUPERVISOR' ? 'bg-orange-600 text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4" /> CS Supervisors ({users.filter((u) => u.role === 'SUPERVISOR').length})
        </button>

        <button
          onClick={() => setRoleFilter('OPS_MANAGER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            roleFilter === 'OPS_MANAGER' ? 'bg-orange-600 text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <MapPin className="w-4 h-4" /> Operations Managers ({users.filter((u) => u.role === 'OPS_MANAGER').length})
        </button>
      </div>

      {/* Staff User Accounts Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <span className="text-xs font-bold text-stone-500">
            Showing {filteredUsers.length} of {users.length} accounts
          </span>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider bg-stone-50">
                <th className="py-3.5 px-4 rounded-l-xl">Staff Details</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Branch / Unit</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.userId} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-stone-900">{u.fullName}</div>
                    <div className="text-[11px] text-stone-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${getRoleBadgeStyle(
                        u.role
                      )}`}
                    >
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-stone-700 font-medium">{u.branchName || 'Central Operations'}</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={u.status || 'ACTIVE'} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Password reset allowed only for Staff accounts (not Customer accounts) */}
                      {u.role !== 'CUSTOMER' ? (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowResetPasswordModal(true);
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                          title="Reset Password"
                        >
                          <Lock className="w-3.5 h-3.5 text-orange-600" /> Reset Password
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-400 italic px-2.5 py-1 bg-stone-100 rounded-lg">
                          Customer Managed
                        </span>
                      )}

                      {/* Disallow deactivating System Admin account */}
                      {u.role !== 'ADMIN' ? (
                        <button
                          onClick={() => handleToggleUserStatus(u.userId, u.status || 'ACTIVE')}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                            u.status === 'INACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {u.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-400 italic px-2 py-1 bg-stone-100 rounded-lg">
                          System Admin
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Account Modal (Only Staff Roles Allowed: Branch Manager, Rider, CS Supervisor, Ops Manager) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Register Staff Account</h3>
                <p className="text-xs text-stone-500">Create new staff credentials (System Admin is system-configured).</p>
              </div>
              <button onClick={() => setShowAddUserModal(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  placeholder="e.g. Kasun Silva"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  placeholder="e.g. manager.colombo@spiceavenue.com"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Assigned Staff Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800"
                >
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                  <option value="RIDER">Delivery Rider</option>
                  <option value="SUPERVISOR">Customer Service Supervisor</option>
                  <option value="OPS_MANAGER">Operations Manager</option>
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  * Note: Only 1 System Administrator exists per system and cannot be created via UI.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md">
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Reset Staff Password</h3>
            <p className="text-xs text-stone-600 mb-4">Set a new temporary password for {selectedUser.fullName} ({selectedUser.email}).</p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-orange-600 text-white font-bold rounded-xl shadow-md">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
