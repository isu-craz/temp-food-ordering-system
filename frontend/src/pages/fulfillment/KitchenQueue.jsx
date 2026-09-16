import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { mockOrders } from '../../api/mockData';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import {
  ChefHat,
  Check,
  X,
  Clock,
  Bike,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  UtensilsCrossed,
  AlertTriangle,
  Search,
  Filter,
  Building2,
} from 'lucide-react';

export default function KitchenQueue() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // If user is a BRANCH_MANAGER, lock to their assigned branchId (default 1)
  const initialBranchId = user?.branchId || 1;
  const [branchId, setBranchId] = useState(initialBranchId);
  const [selectedRiderMap, setSelectedRiderMap] = useState({});

  // Pipeline Filter States
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Modal State
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const PRESET_REASONS = [
    'Kitchen overloaded - high order volume',
    'Required menu ingredients out of stock',
    'Branch closing soon / kitchen shutting down',
    'Bad weather / delivery route suspended',
  ];

  useEffect(() => {
    fetchOrdersAndRiders();
  }, [branchId]);

  const fetchOrdersAndRiders = async () => {
    try {
      setLoading(true);
      const [orderRes, riderRes] = await Promise.all([
        axiosClient.get(`/fulfillment/orders/incoming?branchId=${branchId}`),
        axiosClient.get('/delivery/riders/available'),
      ]);
      if (orderRes && orderRes.success && Array.isArray(orderRes.data) && orderRes.data.length > 0) {
        setOrders(orderRes.data);
      } else {
        setOrders(mockOrders);
      }

      if (riderRes && riderRes.success && Array.isArray(riderRes.data) && riderRes.data.length > 0) {
        setAvailableRiders(riderRes.data);
      } else {
        setAvailableRiders([
          { riderId: 5, userId: 5, fullName: 'Kamal Fernando', phoneNumber: '0771112233', riderStatus: 'AVAILABLE' },
          { riderId: 6, userId: 6, fullName: 'Nimal Bandara', phoneNumber: '0714445566', riderStatus: 'AVAILABLE' },
        ]);
      }
    } catch (err) {
      console.warn('Backend API unavailable, using mock data:', err);
      setOrders(mockOrders);
      setAvailableRiders([
        { riderId: 5, userId: 5, fullName: 'Kamal Fernando', phoneNumber: '0771112233', riderStatus: 'AVAILABLE' },
        { riderId: 6, userId: 6, fullName: 'Nimal Bandara', phoneNumber: '0714445566', riderStatus: 'AVAILABLE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    const mins = prompt('Enter estimated preparation time (in minutes):', '20');
    if (!mins || isNaN(mins) || Number(mins) < 5) {
      alert('Please enter a valid preparation time (minimum 5 minutes)');
      return;
    }
    const prepMinutes = Number(mins);
    try {
      await axiosClient.patch(`/fulfillment/orders/${orderId}/confirm`, {
        estimatedPrepMinutes: prepMinutes,
      });
      fetchOrdersAndRiders();
    } catch (err) {
      console.warn('API error, performing local state fallback:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? { ...o, status: 'CONFIRMED', estimatedPrepMinutes: prepMinutes }
            : o
        )
      );
    }
  };

  const openRejectModal = (order) => {
    setRejectingOrder(order);
    setRejectionReason(PRESET_REASONS[0]);
    setCustomReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    const finalReason = rejectionReason === 'OTHER' ? customReason.trim() : rejectionReason;
    if (!finalReason) {
      alert('Please provide or select a rejection reason!');
      return;
    }

    try {
      await axiosClient.patch(`/fulfillment/orders/${rejectingOrder.orderId}/reject`, {
        reason: finalReason,
      });
      fetchOrdersAndRiders();
    } catch (err) {
      console.warn('API error, performing local state fallback for rejection:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === rejectingOrder.orderId
            ? { ...o, status: 'CANCELLED', rejectionReason: finalReason }
            : o
        )
      );
    } finally {
      setRejectingOrder(null);
    }
  };

  const handleAdvanceStatus = async (orderId, targetStatus) => {
    try {
      if (targetStatus === 'PREPARING') {
        await axiosClient.patch(`/fulfillment/orders/${orderId}/preparing`);
      } else if (targetStatus === 'READY_FOR_PICKUP') {
        await axiosClient.patch(`/fulfillment/orders/${orderId}/ready-pickup`);
      } else if (targetStatus === 'PICKED_UP') {
        await axiosClient.patch(`/fulfillment/orders/${orderId}/picked-up`);
      } else if (targetStatus === 'READY_FOR_DELIVERY') {
        await axiosClient.patch(`/fulfillment/orders/${orderId}/ready-delivery`);
      }
      fetchOrdersAndRiders();
    } catch (err) {
      console.warn('API error, performing local state fallback:', err);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: targetStatus } : o))
      );
    }
  };

  const handleAssignRider = async (orderId) => {
    const riderId = selectedRiderMap[orderId];
    if (!riderId) {
      alert('Please select an available delivery rider from the dropdown');
      return;
    }
    const selectedRider = availableRiders.find((r) => (r.riderId || r.userId) === Number(riderId));
    try {
      await axiosClient.patch(`/fulfillment/orders/${orderId}/assign-rider`, {
        riderId: Number(riderId),
      });
      alert(`Rider ${selectedRider?.fullName || ''} assigned to order!`);
      fetchOrdersAndRiders();
    } catch (err) {
      console.warn('API error, performing local state fallback:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? {
                ...o,
                status: 'DISPATCHED',
                assignedRiderName: selectedRider?.fullName || 'Assigned Rider',
              }
            : o
        )
      );
      alert(`Rider ${selectedRider?.fullName || 'Kamal'} assigned successfully!`);
    }
  };

  // Pipeline Status Counts Calculation
  const counts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY: orders.filter((o) => ['READY_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.status)).length,
    DISPATCHED: orders.filter((o) => ['DISPATCHED', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
    COMPLETED: orders.filter((o) => ['DELIVERED', 'PICKED_UP'].includes(o.status)).length,
    CANCELLED: orders.filter((o) => ['CANCELLED', 'REJECTED'].includes(o.status)).length,
  };

  // Filtering Logic
  const filteredOrders = orders.filter((order) => {
    if (activeStatusFilter === 'PENDING' && order.status !== 'PENDING') return false;
    if (activeStatusFilter === 'CONFIRMED' && order.status !== 'CONFIRMED') return false;
    if (activeStatusFilter === 'PREPARING' && order.status !== 'PREPARING') return false;
    if (activeStatusFilter === 'READY' && !['READY_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(order.status)) return false;
    if (activeStatusFilter === 'DISPATCHED' && !['DISPATCHED', 'OUT_FOR_DELIVERY'].includes(order.status)) return false;
    if (activeStatusFilter === 'COMPLETED' && !['DELIVERED', 'PICKED_UP'].includes(order.status)) return false;
    if (activeStatusFilter === 'CANCELLED' && !['CANCELLED', 'REJECTED'].includes(order.status)) return false;

    if (orderTypeFilter !== 'ALL' && order.orderType !== orderTypeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber?.toLowerCase().includes(q);
      const matchCust = order.customerName?.toLowerCase().includes(q);
      const matchPhone = order.customerPhone?.toLowerCase().includes(q);
      const matchItem = order.items?.some((i) => i.itemName?.toLowerCase().includes(q));
      if (!matchNum && !matchCust && !matchPhone && !matchItem) return false;
    }

    return true;
  });

  const PIPELINE_TABS = [
    { id: 'ALL', label: 'All Orders', count: counts.ALL, color: 'bg-stone-800 text-white' },
    { id: 'PENDING', label: '⏳ Pending', count: counts.PENDING, color: 'bg-amber-500 text-white' },
    { id: 'CONFIRMED', label: '⏱️ Confirmed', count: counts.CONFIRMED, color: 'bg-blue-600 text-white' },
    { id: 'PREPARING', label: '🍳 Kitchen Cooking', count: counts.PREPARING, color: 'bg-purple-600 text-white' },
    { id: 'READY', label: '📦 Food Packed / Ready', count: counts.READY, color: 'bg-indigo-600 text-white' },
    { id: 'DISPATCHED', label: '🛵 Dispatched', count: counts.DISPATCHED, color: 'bg-orange-600 text-white' },
    { id: 'COMPLETED', label: '✅ Completed', count: counts.COMPLETED, color: 'bg-emerald-600 text-white' },
    { id: 'CANCELLED', label: '✕ Cancelled / Rejected', count: counts.CANCELLED, color: 'bg-rose-600 text-white' },
  ];

  const branchName = branchId === 1 ? 'Spice Avenue - Colombo Central' : 'Spice Avenue - Negombo Coastal';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        badgeIcon={ChefHat}
        badgeText="Kitchen Order Fulfillment"
        badgeColor="bg-blue-600/90"
        title="Incoming Order Processing & Kitchen Queue"
        description="Accept/reject incoming orders, set preparation time, manage cooking pipeline, and dispatch riders."
        switcherTabs={[
          { label: 'Kitchen Queue', to: '/kitchen-queue', icon: ChefHat, active: true },
          { label: 'Menu Management', to: '/menu-admin', icon: UtensilsCrossed, active: false },
        ]}
      >
        {/* Branch Indicator: Read-only badge for Branch Manager, dropdown for Admin/Ops */}
        {user?.role === 'BRANCH_MANAGER' ? (
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3.5 py-2 rounded-2xl">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-stone-300">Branch:</span>
            <span className="text-xs font-black text-white">{branchName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-2 rounded-2xl">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-stone-300">Branch:</span>
            <select
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="1" className="bg-stone-900 text-white">Spice Avenue - Colombo Central</option>
              <option value="2" className="bg-stone-900 text-white">Spice Avenue - Negombo Coastal</option>
            </select>
          </div>
        )}

        <button
          onClick={fetchOrdersAndRiders}
          className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-2xl border border-stone-700 text-xs flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Sync Queue
        </button>
      </PageHeader>

      {/* Interactive Filter & Pipeline Control Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm mb-8 space-y-4">
        {/* Row 1: Pipeline Status Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-orange-500" /> Pipeline Stage Filter:
            </span>
            <span className="text-xs text-stone-600 font-semibold">
              Showing <strong className="text-stone-900">{filteredOrders.length}</strong> of {orders.length} orders
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {PIPELINE_TABS.map((tab) => {
              const isActive = activeStatusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatusFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? `${tab.color} shadow-md ring-2 ring-offset-1 ring-stone-900`
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Search Bar & Order Type Filter */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer Name, Phone, Food..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-stone-600 shrink-0">Fulfillment Type:</span>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="ALL">All Order Types (Delivery & Pickup)</option>
              <option value="DELIVERY">🚚 Delivery Orders Only</option>
              <option value="PICKUP">🛍️ Customer Pickup Only</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading incoming orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200 space-y-2">
          <p className="font-bold text-stone-600">No orders match the selected pipeline status or search filter.</p>
          <p className="text-xs text-stone-600">Try selecting "All Orders" or clearing your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                order.status === 'PENDING' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-stone-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                  <div>
                    <span className="font-black text-stone-900 text-sm block">{order.orderNumber}</span>
                    <span className="text-xs font-semibold text-stone-600">
                      Customer: {order.customerName} ({order.customerPhone})
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <span className="block text-[10px] font-bold text-stone-400 uppercase mt-1">
                      {order.orderType}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-4 bg-stone-50 p-3 rounded-2xl">
                  {order.items?.map((item) => (
                    <div key={item.orderItemId} className="flex justify-between text-xs">
                      <span className="font-medium text-stone-800">
                        <strong className="font-black text-stone-900">{item.quantity}x</strong> {item.itemName}{' '}
                        {item.variationName && <span className="text-stone-500 font-normal">({item.variationName})</span>}
                      </span>
                      <span className="font-bold text-stone-900">LKR {Number(item.totalPrice).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-stone-200 flex justify-between text-xs font-black text-stone-900">
                    <span>Order Total:</span>
                    <span className="text-orange-600">LKR {Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="text-xs text-stone-600 mb-4 space-y-1">
                  {order.deliveryAddressText && (
                    <p className="text-[11px] text-stone-500">
                      <strong className="text-stone-700">Deliver to:</strong> {order.deliveryAddressText}
                    </p>
                  )}
                  {order.estimatedPrepMinutes && (
                    <p className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" /> Estimated Prep Time: {order.estimatedPrepMinutes} mins
                    </p>
                  )}
                  {order.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Order Rejected</span>
                        <span className="font-normal text-[11px]">{order.rejectionReason}</span>
                      </div>
                    </div>
                  )}
                  {order.assignedRiderName && (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5" /> Assigned Rider: {order.assignedRiderName}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons Workflow State Controller */}
              <div className="pt-4 border-t border-stone-100">
                {order.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleConfirmOrder(order.orderId)}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                    >
                      <Check className="w-4 h-4" /> Accept & Set Prep Time
                    </button>
                    <button
                      onClick={() => openRejectModal(order)}
                      className="py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-4 h-4" /> Reject Order
                    </button>
                  </div>
                )}

                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleAdvanceStatus(order.orderId, 'PREPARING')}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <ChefHat className="w-4 h-4" /> Start Cooking / Food Prep
                  </button>
                )}

                {order.status === 'PREPARING' && order.orderType === 'PICKUP' && (
                  <button
                    onClick={() => handleAdvanceStatus(order.orderId, 'READY_FOR_PICKUP')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" /> Food Ready for Customer Pickup
                  </button>
                )}

                {order.status === 'READY_FOR_PICKUP' && order.orderType === 'PICKUP' && (
                  <button
                    onClick={() => handleAdvanceStatus(order.orderId, 'PICKED_UP')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" /> Mark Order as Collected (PICKED_UP)
                  </button>
                )}

                {order.status === 'PREPARING' && order.orderType === 'DELIVERY' && (
                  <button
                    onClick={() => handleAdvanceStatus(order.orderId, 'READY_FOR_DELIVERY')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" /> Food Packed & Ready for Delivery
                  </button>
                )}

                {(order.status === 'READY_FOR_DELIVERY' || order.status === 'PREPARING') && order.orderType === 'DELIVERY' && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-2">
                    <select
                      value={selectedRiderMap[order.orderId] || ''}
                      onChange={(e) =>
                        setSelectedRiderMap({ ...selectedRiderMap, [order.orderId]: e.target.value })
                      }
                      className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">-- Choose Available Rider --</option>
                      {availableRiders.map((r) => (
                        <option key={r.riderId || r.userId} value={r.riderId || r.userId}>
                          {r.fullName} ({r.phoneNumber || 'Available'})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignRider(order.orderId)}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                    >
                      <Bike className="w-3.5 h-3.5" /> Dispatch Rider
                    </button>
                  </div>
                )}

                {order.status === 'DISPATCHED' && (
                  <p className="text-center text-xs font-bold text-blue-600 py-1 flex items-center justify-center gap-1">
                    <Bike className="w-4 h-4" /> Dispatched for Delivery
                  </p>
                )}

                {(order.status === 'DELIVERED' || order.status === 'PICKED_UP') && (
                  <p className="text-center text-xs font-bold text-emerald-600 py-1">
                    ✓ Order Complete
                  </p>
                )}

                {order.status === 'CANCELLED' && (
                  <p className="text-center text-xs font-bold text-rose-600 py-1">
                    ✕ Order Cancelled / Rejected
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-black text-stone-900">Reject Incoming Order</h3>
              </div>
              <button
                onClick={() => setRejectingOrder(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Rejecting order <strong className="text-stone-900">{rejectingOrder.orderNumber}</strong> ({rejectingOrder.customerName}). Please select or enter a reason:
            </p>

            {/* Preset Options */}
            <div className="space-y-2 mb-4">
              {PRESET_REASONS.map((preset) => (
                <label
                  key={preset}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer text-xs font-semibold transition-all ${
                    rejectionReason === preset
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={preset}
                    checked={rejectionReason === preset}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{preset}</span>
                </label>
              ))}

              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer text-xs font-semibold transition-all ${
                  rejectionReason === 'OTHER'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <input
                  type="radio"
                  name="rejectionReason"
                  value="OTHER"
                  checked={rejectionReason === 'OTHER'}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Other (Specify custom reason below)</span>
              </label>
            </div>

            {rejectionReason === 'OTHER' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom rejection reason..."
                rows={3}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              />
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
