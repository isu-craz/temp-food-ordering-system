import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import { Bike, CheckCircle2, Navigation, Clock, Phone, MapPin, Package, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RiderPortal() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [riderStatus, setRiderStatus] = useState(user?.riderStatus || 'AVAILABLE');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'history'

  useEffect(() => {
    fetchRiderData();
  }, []);

  const fetchRiderData = async () => {
    try {
      setLoading(true);
      const [tasksRes, histRes, profileRes] = await Promise.all([
        axiosClient.get('/delivery/my-tasks'),
        axiosClient.get('/delivery/my-history'),
        axiosClient.get('/auth/profile'),
      ]);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (histRes.success) setHistory(histRes.data);
      if (profileRes.success && profileRes.data.riderStatus) {
        setRiderStatus(profileRes.data.riderStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (status) => {
    try {
      await axiosClient.patch('/delivery/riders/my-status', { status });
      setRiderStatus(status);
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleAcceptTask = async (deliveryId) => {
    try {
      await axiosClient.patch(`/delivery/tasks/${deliveryId}/accept`);
      alert('Delivery accepted! Rider status is now BUSY.');
      fetchRiderData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting delivery');
    }
  };

  const handleOutForDelivery = async (deliveryId) => {
    try {
      await axiosClient.patch(`/delivery/tasks/${deliveryId}/out-for-delivery`);
      fetchRiderData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelivered = async (deliveryId) => {
    if (!window.confirm('Confirm package has been handed over to customer?')) return;
    try {
      await axiosClient.patch(`/delivery/tasks/${deliveryId}/delivered`);
      alert('Order DELIVERED! Rider status has been reset to AVAILABLE.');
      fetchRiderData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking delivered');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Availability Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-extrabold uppercase mb-1 inline-block">
              Member 5 Module
            </span>
            <h1 className="text-2xl font-black text-stone-900">Delivery Rider Portal</h1>
            <p className="text-xs text-stone-500">Manage your shift availability, accept deliveries, and update route progress.</p>
          </div>

          {/* Availability Status Buttons */}
          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
            {['AVAILABLE', 'BUSY', 'OFFLINE'].map((status) => (
              <button
                key={status}
                onClick={() => handleUpdateAvailability(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  riderStatus === status
                    ? status === 'AVAILABLE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : status === 'BUSY'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-rose-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tasks' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            Active Deliveries ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            Completed History ({history.length})
          </button>
        </div>
        <button
          onClick={fetchRiderData}
          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading deliveries...</div>
      ) : activeTab === 'tasks' ? (
        tasks.length === 0 ? (
          <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
            No active deliveries assigned to you right now. Set your status to <strong>AVAILABLE</strong> to receive orders!
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.deliveryId}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-4 pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-xs font-bold text-orange-600">{task.branchName}</span>
                    <h3 className="font-black text-stone-900 text-base">{task.orderNumber}</h3>
                  </div>
                  <StatusBadge status={task.deliveryStatus} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700 mb-4 bg-stone-50 p-4 rounded-2xl">
                  <div>
                    <p className="font-semibold text-stone-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" /> Customer Location:
                    </p>
                    <p className="font-bold text-stone-900">{task.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-orange-600" /> Customer Contact:
                    </p>
                    <p className="font-bold text-stone-900">
                      {task.customerName} ({task.customerPhone})
                    </p>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  {task.deliveryStatus === 'ASSIGNED' && (
                    <button
                      onClick={() => handleAcceptTask(task.deliveryId)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Accept Delivery Task
                    </button>
                  )}

                  {task.deliveryStatus === 'ACCEPTED' && (
                    <button
                      onClick={() => handleOutForDelivery(task.deliveryId)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Navigation className="w-4 h-4" /> Picked Up & Out For Delivery
                    </button>
                  )}

                  {task.deliveryStatus === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleDelivered(task.deliveryId)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm Delivered to Customer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History tab */
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              No delivery history records found.
            </div>
          ) : (
            history.map((h) => (
              <div
                key={h.deliveryId}
                className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900">{h.orderNumber}</span>
                  <p className="text-stone-500">{h.deliveryAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Delivered
                  </span>
                  <p className="text-[10px] text-stone-400 mt-1">
                    {h.deliveredAt ? new Date(h.deliveredAt).toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
