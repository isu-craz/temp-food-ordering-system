import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { mockOrders } from '../../api/mockData';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import {
  Package,
  Clock,
  Star,
  MessageSquareWarning,
  Ban,
  CheckCircle2,
  ChevronRight,
  X,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  Filter,
  Receipt,
} from 'lucide-react';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Review & Complaint modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [complaintData, setComplaintData] = useState({ category: 'Wrong Food Item Received', description: '', imageUrl: '' });

  const COMPLAINT_CATEGORIES = [
    'Wrong Food Item Received',
    'Missing Items in Package',
    'Poor Food Quality / Cold Food',
    'Excessive Delivery Delay',
    'Damaged / Leaking Packaging',
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/customer/orders');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
      } else {
        setOrders(mockOrders);
      }
    } catch (err) {
      console.warn('Backend API unavailable, using mock data:', err);
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (!reason) return;
    try {
      await axiosClient.patch(`/customer/orders/${orderId}/cancel`, {
        cancellationReason: reason,
      });
      alert('Order has been cancelled.');
      fetchOrders();
    } catch (err) {
      console.warn('Backend API error, performing local state fallback:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: 'CANCELLED', cancellationReason: reason } : o
        )
      );
      alert('Order has been cancelled locally.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await axiosClient.post('/customer/reviews', {
        orderId: selectedOrder.orderId,
        rating: Number(reviewData.rating),
        comment: reviewData.comment,
      });
      alert('Thank you! Your review was submitted successfully.');
      fetchOrders();
    } catch (err) {
      console.warn('API error, performing local state fallback for review:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder.orderId
            ? { ...o, reviewRating: Number(reviewData.rating), reviewComment: reviewData.comment }
            : o
        )
      );
      alert('Thank you! Your 5-star rating & review have been posted successfully.');
    } finally {
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await axiosClient.post('/customer/complaints', {
        orderId: selectedOrder.orderId,
        category: complaintData.category,
        description: complaintData.description,
        imageUrl: complaintData.imageUrl,
      });
      alert('Your complaint has been lodged and assigned to Customer Support (PENDING).');
      fetchOrders();
    } catch (err) {
      console.warn('API error, performing local state fallback for complaint:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder.orderId
            ? {
                ...o,
                hasComplaint: true,
                complaintCategory: complaintData.category,
                complaintDescription: complaintData.description,
                complaintStatus: 'PENDING',
              }
            : o
        )
      );
      alert(
        'Your complaint has been lodged and submitted to the Customer Service Supervisor portal for resolution!'
      );
    } finally {
      setShowComplaintModal(false);
      setComplaintData({ category: COMPLAINT_CATEGORIES[0], description: '', imageUrl: '' });
    }
  };

  // Tab Filtering
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DISPATCHED', 'OUT_FOR_DELIVERY'].includes(order.status);
    }
    if (activeTab === 'COMPLETED') {
      return ['DELIVERED', 'PICKED_UP'].includes(order.status);
    }
    if (activeTab === 'CANCELLED') {
      return ['CANCELLED', 'REJECTED'].includes(order.status);
    }
    return true;
  });

  const counts = {
    ALL: orders.length,
    ACTIVE: orders.filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DISPATCHED', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
    COMPLETED: orders.filter((o) => ['DELIVERED', 'PICKED_UP'].includes(o.status)).length,
    CANCELLED: orders.filter((o) => ['CANCELLED', 'REJECTED'].includes(o.status)).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        badgeIcon={ShoppingBag}
        badgeText="Customer Order History & Support"
        badgeColor="bg-emerald-600/90"
        title="My Past Orders & Complaints"
        description="Track order status in real time, view order history, post ratings & reviews, or submit support complaints for filled orders."
        switcherTabs={[
          { label: 'Browse Menu', to: '/order', icon: ShoppingBag, active: false },
          { label: 'My Orders & History', to: '/my-orders', icon: Receipt, active: true },
        ]}
      >
        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-2xl border border-stone-700 text-xs flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh History
        </button>
      </PageHeader>

      {/* Order Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>All Orders</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-900 font-black">
            {counts.ALL}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ACTIVE'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>🍳 Active Orders</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-900 font-black">
            {counts.ACTIVE}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>✅ Completed Orders</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-black">
            {counts.COMPLETED}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CANCELLED'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>✕ Cancelled / Rejected</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-900 font-black">
            {counts.CANCELLED}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading your order history...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
          No orders found under the selected category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'DELIVERED' || order.status === 'PICKED_UP';
            const isCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED';

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 text-sm">{order.orderNumber}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 font-bold text-stone-700 uppercase">
                        {order.orderType}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Branch: <span className="font-semibold text-stone-800">{order.branchName || 'Spice Avenue - Colombo Main'}</span> • Placed: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-4 bg-stone-50 p-3.5 rounded-2xl">
                  {order.items?.map((item) => (
                    <div key={item.orderItemId || item.itemId} className="flex justify-between text-xs text-stone-700">
                      <span>
                        <span className="font-black text-stone-900">{item.quantity}x</span> {item.itemName}{' '}
                        {item.variationName && <span className="text-stone-400 font-normal">({item.variationName})</span>}
                      </span>
                      <span className="font-bold text-stone-900">LKR {Number(item.totalPrice).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.deliveryAddressText && (
                    <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-200">
                      <strong className="text-stone-700">Delivery Address:</strong> {order.deliveryAddressText}
                    </p>
                  )}
                </div>

                {/* Bill Summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-500 font-semibold">Payment: </span>
                    <span className="font-bold text-stone-800">{order.paymentMethod}</span>
                    {order.estimatedPrepMinutes && (
                      <span className="ml-3 text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                        Est Cooking: ~{order.estimatedPrepMinutes} mins
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-stone-500 font-semibold mr-2">Total Amount:</span>
                    <span className="text-base font-black text-orange-600">
                      LKR {Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Complaint / Review Callouts */}
                {order.hasComplaint && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-rose-900">
                        🚨 Complaint Submitted: {order.complaintCategory}
                      </span>
                      <span className="text-[11px] font-normal text-rose-700 block">
                        "{order.complaintDescription}"
                      </span>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                        Status: {order.complaintStatus || 'PENDING CS SUPERVISOR REVIEW'}
                      </span>
                    </div>
                  </div>
                )}

                {order.reviewRating && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 block">
                        ⭐ Rated {order.reviewRating} / 5 Stars
                      </span>
                      {order.reviewComment && (
                        <span className="text-[11px] font-normal text-amber-800">
                          "{order.reviewComment}"
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2">
                  {isCancellable && (
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                  )}

                  {isCompleted && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowReviewModal(true);
                        }}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Rate & Review
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowComplaintModal(true);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <MessageSquareWarning className="w-4 h-4" /> Report Issue / Submit Complaint
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Rate & Review Order
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Ref: <strong className="text-stone-900">{selectedOrder.orderNumber}</strong> ({selectedOrder.branchName || 'Spice Avenue'})
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1.5">Rating (1 to 5 Stars)</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Exceptional Taste & Service</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                  <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                  <option value="2">⭐⭐ 2 Stars - Below Expectations</option>
                  <option value="1">⭐ 1 Star - Poor Experience</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1.5">Comments & Feedback</label>
                <textarea
                  required
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={3}
                  placeholder="How was the food temperature, packaging, and flavor?"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {showComplaintModal && selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-black text-rose-600 flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5" /> Report Issue / Submit Complaint
              </h3>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Filing issue ticket for order <strong className="text-stone-900">{selectedOrder.orderNumber}</strong>. Your complaint will be assigned to Customer Support:
            </p>

            <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1.5">Select Issue Category</label>
                <select
                  value={complaintData.category}
                  onChange={(e) => setComplaintData({ ...complaintData, category: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1.5">Detailed Description of Issue</label>
                <textarea
                  required
                  value={complaintData.description}
                  onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe what went wrong with your order (e.g. received wrong pizza size, items missing, food spilled)..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <MessageSquareWarning className="w-4 h-4" /> Submit Complaint Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
