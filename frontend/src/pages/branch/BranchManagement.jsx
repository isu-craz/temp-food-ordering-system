import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import { MapPin, Plus, Edit2, ShieldAlert, TrendingUp, DollarSign, PackageCheck, Star, AlertTriangle, Snowflake, Sun, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BranchManagement() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // New Branch Form State
  const [newBranch, setNewBranch] = useState({
    branchName: '',
    streetAddress: '',
    contactNumber: '',
    email: '',
    openingTime: '08:00:00',
    closingTime: '23:00:00',
  });

  // New Area Form State
  const [newArea, setNewArea] = useState({
    areaName: '',
    deliveryFee: 200,
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/branches?onlyActive=false');
      if (res.success && res.data) {
        setBranches(res.data);
        if (res.data.length > 0) {
          if (!selectedBranch) {
            selectBranch(res.data[0]);
          } else {
            const current = res.data.find(b => b.branchId === selectedBranch.branchId);
            if (current) setSelectedBranch(current);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectBranch = async (branch) => {
    setSelectedBranch(branch);
    try {
      const perfRes = await axiosClient.get(`/branches/${branch.branchId}/performance`);
      if (perfRes.success) {
        setPerformance(perfRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/branches', newBranch);
      if (res.success) {
        setShowAddModal(false);
        setNewBranch({
          branchName: '',
          streetAddress: '',
          contactNumber: '',
          email: '',
          openingTime: '08:00:00',
          closingTime: '23:00:00',
        });
        alert('Branch registered successfully!');
        fetchBranches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating branch');
    }
  };

  const handleToggleFreeze = async (branchId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = currentStatus === 'ACTIVE' ? 'Freeze / Deactivate' : 'Unfreeze / Activate';
    if (!window.confirm(`Are you sure you want to ${actionText} this branch?`)) return;
    try {
      const res = await axiosClient.patch(`/branches/${branchId}/status?status=${nextStatus}`);
      if (res.success) {
        fetchBranches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating branch status');
    }
  };

  const handleAddDeliveryArea = async (e) => {
    e.preventDefault();
    if (!selectedBranch) return;
    try {
      const res = await axiosClient.post(`/branches/${selectedBranch.branchId}/delivery-areas`, newArea);
      if (res.success) {
        setShowAreaModal(false);
        setNewArea({ areaName: '', deliveryFee: 200 });
        const updated = await axiosClient.get(`/branches/${selectedBranch.branchId}`);
        if (updated.success) setSelectedBranch(updated.data);
        fetchBranches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding delivery area');
    }
  };

  const filteredBranches = branches.filter((b) => {
    if (statusFilter === 'ACTIVE') return b.status === 'ACTIVE';
    if (statusFilter === 'INACTIVE') return b.status === 'INACTIVE';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-900 text-[10px] font-extrabold uppercase">
              Member 1 & System Administrator Portal
            </span>
            <h1 className="text-2xl font-black text-stone-900">Branch Management & Control</h1>
          </div>
          <p className="text-xs text-stone-600">
            View all registered branches from the database, freeze/unfreeze operations, and configure delivery coverage zones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBranches}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
            title="Reload from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Register New Branch
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-3">
        <span className="text-xs font-bold text-stone-500 mr-2">Filter:</span>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'ALL' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
          }`}
        >
          All Branches ({branches.length})
        </button>
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
          }`}
        >
          Active ({branches.filter(b => b.status === 'ACTIVE').length})
        </button>
        <button
          onClick={() => setStatusFilter('INACTIVE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'INACTIVE' ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-700'
          }`}
        >
          Frozen / Inactive ({branches.filter(b => b.status === 'INACTIVE').length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading branch records from database...</div>
      ) : filteredBranches.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
          No branches found. Click "Register New Branch" above to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Branch List Left (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Registered Branches</h2>
            {filteredBranches.map((b) => (
              <div
                key={b.branchId}
                onClick={() => selectBranch(b)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedBranch?.branchId === b.branchId
                    ? 'border-orange-500 bg-orange-50/20 shadow-md ring-1 ring-orange-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{b.branchName}</h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" /> {b.streetAddress}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-3 border-t border-stone-100 mt-3">
                  <div>
                    <span className="text-stone-400 block">Operating Hours:</span>
                    <span className="font-medium">{b.openingTime} - {b.closingTime}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Assigned Manager:</span>
                    <span className="font-medium text-stone-800">{b.managerName || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Freeze / Unfreeze Action Button */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {b.deliveryAreas ? b.deliveryAreas.length : 0} Delivery Zones
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFreeze(b.branchId, b.status);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                      b.status === 'ACTIVE'
                        ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {b.status === 'ACTIVE' ? (
                      <>
                        <Snowflake className="w-3.5 h-3.5" /> Freeze Branch
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5" /> Unfreeze (Activate)
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Branch Details & Delivery Areas Right (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedBranch ? (
              <>
                {/* Performance Cards */}
                {performance && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Total Orders</span>
                      <p className="text-xl font-black text-stone-900">{performance.totalOrders}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Total Revenue</span>
                      <p className="text-xl font-black text-emerald-600">LKR {Number(performance.totalRevenue).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Avg Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <p className="text-xl font-black text-stone-900">{performance.averageRating} / 5</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                      <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Complaints</span>
                      <p className="text-xl font-black text-rose-600">{performance.complaintCount}</p>
                    </div>
                  </div>
                )}

                {/* Delivery Areas for Selected Branch */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {selectedBranch.branchName} – Delivery Zones
                      </h3>
                      <p className="text-xs text-stone-500">Non-GPS delivery coverage areas configured for this branch.</p>
                    </div>
                    <button
                      onClick={() => setShowAreaModal(true)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Zone
                    </button>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {selectedBranch.deliveryAreas && selectedBranch.deliveryAreas.length > 0 ? (
                      selectedBranch.deliveryAreas.map((area) => (
                        <div key={area.areaId} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-900 block">{area.areaName}</span>
                            <span className="text-stone-500">Standard Delivery Fee</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-stone-900">LKR {Number(area.deliveryFee).toFixed(2)}</span>
                            <span className="block text-[10px] text-emerald-600 font-semibold">{area.status}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-400 py-4 text-center">No delivery areas configured for this branch yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
                Select a branch to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Register New Branch</h3>
            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  value={newBranch.branchName}
                  onChange={(e) => setNewBranch({ ...newBranch, branchName: e.target.value })}
                  placeholder="e.g. Spice Avenue - Kandy Central"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newBranch.streetAddress}
                  onChange={(e) => setNewBranch({ ...newBranch, streetAddress: e.target.value })}
                  placeholder="No. 12, Peradeniya Road"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={newBranch.contactNumber}
                    onChange={(e) => setNewBranch({ ...newBranch, contactNumber: e.target.value })}
                    placeholder="0812345678"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Branch Email</label>
                  <input
                    type="email"
                    required
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                    placeholder="kandy@spiceavenue.com"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Opening Time</label>
                  <input
                    type="time"
                    required
                    value={newBranch.openingTime}
                    onChange={(e) => setNewBranch({ ...newBranch, openingTime: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Closing Time</label>
                  <input
                    type="time"
                    required
                    value={newBranch.closingTime}
                    onChange={(e) => setNewBranch({ ...newBranch, closingTime: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Delivery Area Modal */}
      {showAreaModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-3">Add Delivery Zone</h3>
            <p className="text-xs text-stone-500 mb-4">Branch: {selectedBranch.branchName}</p>
            <form onSubmit={handleAddDeliveryArea} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Delivery Area Name</label>
                <input
                  type="text"
                  required
                  value={newArea.areaName}
                  onChange={(e) => setNewArea({ ...newArea, areaName: e.target.value })}
                  placeholder="e.g. Peradeniya Town"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Delivery Fee (LKR)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newArea.deliveryFee}
                  onChange={(e) => setNewArea({ ...newArea, deliveryFee: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAreaModal(false)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                >
                  Add Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
