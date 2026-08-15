import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import { ChefHat, Check, X, Clock, Bike, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function KitchenQueue() {
  const [orders, setOrders] = useState([]);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState(1);
  const [selectedRiderMap, setSelectedRiderMap] = useState({});

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
      if (orderRes.success) setOrders(orderRes.data);
      if (riderRes.success) setAvailableRiders(riderRes.data);
    } catch (err) {
      console.error(err);
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
    try {
      await axiosClient.patch(`/fulfillment/orders/${orderId}/confirm`, {
        estimatedPrepMinutes: Number(mins),
      });
      fetchOrdersAndRiders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Mandatory rejection reason (e.g. Branch closing soon, item ingredients missing):');
    if (!reason) {
      alert('Rejection reason cannot be blank!');
      return;
    }
    try {
      await axiosClient.patch(`/fulfillment/orders/${orderId}/reject`, { reason });
      fetchOrdersAndRiders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting order');
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
      alert(err.response?.data?.message || 'Error advancing status');
    }
  };

  const handleAssignRider = async (orderId) => {
    const riderId = selectedRiderMap[orderId];
    if (!riderId) {
      alert('Please select an available delivery rider from the dropdown');
      return;
    }
    try {
      await axiosClient.patch(`/fulfillment/orders/${orderId}/assign-rider`, {
        riderId: Number(riderId),
      });
      alert('Rider successfully assigned to delivery task!');
      fetchOrdersAndRiders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning rider');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase">
              Member 4 Module
            </span>
            <h1 className="text-2xl font-black text-stone-900">Kitchen & Order Fulfillment Queue</h1>
          </div>
          <p className="text-xs text-stone-500">Branch Manager queue for kitchen prep workflows and delivery rider dispatches.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={branchId}
            onChange={(e) => setBranchId(Number(e.target.value))}
            className="p-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
          >
            <option value="1">Colombo Central Branch</option>
            <option value="2">Negombo Coastal Branch</option>
          </select>
          <button
            onClick={fetchOrdersAndRiders}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading incoming orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
          No orders in queue for this branch right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                    <p className="text-[11px] text-purple-700 font-semibold">
                      Estimated Cooking: {order.estimatedPrepMinutes} mins
                    </p>
                  )}
                  {order.rejectionReason && (
                    <p className="text-[11px] text-rose-600 font-semibold">
                      Rejection Reason: {order.rejectionReason}
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
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Confirm & Set Prep
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order.orderId)}
                      className="py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject Order
                    </button>
                  </div>
                )}

                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleAdvanceStatus(order.orderId, 'PREPARING')}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ChefHat className="w-4 h-4" /> Start Food Preparation
                  </button>
                )}

                {order.status === 'PREPARING' && order.orderType === 'PICKUP' && (
                  <button
                    onClick={() => handleAdvanceStatus(order.orderId, 'READY_FOR_PICKUP')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Food Ready for Customer Pickup
                  </button>
                )}

                {order.status === 'READY_FOR_PICKUP' && order.orderType === 'PICKUP' && (
                  <button
                    onClick={() => handleAdvanceStatus(order.orderId, 'PICKED_UP')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Mark Order as Collected (PICKED_UP)
                  </button>
                )}

                {order.status === 'PREPARING' && order.orderType === 'DELIVERY' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAdvanceStatus(order.orderId, 'READY_FOR_DELIVERY')}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Food Packed (READY_FOR_DELIVERY)
                    </button>
                  </div>
                )}

                {(order.status === 'READY_FOR_DELIVERY' || order.status === 'PREPARING') && order.orderType === 'DELIVERY' && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-2">
                    <select
                      value={selectedRiderMap[order.orderId] || ''}
                      onChange={(e) =>
                        setSelectedRiderMap({ ...selectedRiderMap, [order.orderId]: e.target.value })
                      }
                      className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="">-- Choose Available Rider --</option>
                      {availableRiders.map((r) => (
                        <option key={r.riderId} value={r.riderId}>
                          {r.fullName} ({r.phoneNumber})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignRider(order.orderId)}
                      className="px-3 py-2 bg-stone-900 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Bike className="w-3.5 h-3.5" /> Assign
                    </button>
                  </div>
                )}

                {(order.status === 'DELIVERED' || order.status === 'PICKED_UP') && (
                  <p className="text-center text-xs font-bold text-emerald-600 py-1">
                    ✓ Order Complete
                  </p>
                )}

                {order.status === 'CANCELLED' && (
                  <p className="text-center text-xs font-bold text-rose-600 py-1">
                    ✕ Order Cancelled
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
