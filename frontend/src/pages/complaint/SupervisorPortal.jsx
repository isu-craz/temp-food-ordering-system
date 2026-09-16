import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { MessageSquareWarning, Star, CheckCircle, Clock, Check, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';

export default function SupervisorPortal() {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [branchReviews, setBranchReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'analytics' | 'reviews'

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchSupervisorData();
  }, []);

  const fetchSupervisorData = async () => {
    try {
      setLoading(true);
      const [compRes, analRes, revRes] = await Promise.all([
        axiosClient.get('/supervisor/complaints'),
        axiosClient.get('/supervisor/feedback-analytics'),
        axiosClient.get('/branches/1/reviews'),
      ]);
      if (compRes.success) setComplaints(compRes.data);
      if (analRes.success) setAnalytics(analRes.data);
      if (revRes.success) setBranchReviews(revRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId, nextStatus) => {
    try {
      await axiosClient.patch(`/supervisor/complaints/${complaintId}/status?status=${nextStatus}`);
      fetchSupervisorData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await axiosClient.patch(`/supervisor/complaints/${selectedComplaint.complaintId}/resolve`, {
        resolutionNotes,
      });
      if (res.success) {
        alert('Complaint successfully resolved and closed!');
        setShowResolveModal(false);
        setResolutionNotes('');
        fetchSupervisorData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving complaint');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        badgeIcon={MessageSquareWarning}
        badgeText="Customer Support Console"
        badgeColor="bg-rose-600/90"
        title="Feedback & Complaint Ticket Resolution"
        description="Investigate order disputes, record resolution notes, close customer complaints, and monitor satisfaction ratings."
      >
        <button
          onClick={fetchSupervisorData}
          className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-2xl border border-stone-700 text-xs flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Sync Tickets
        </button>
      </PageHeader>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Average Satisfaction</span>
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <p className="text-2xl font-black text-stone-900">{analytics.averageRating} / 5.0</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Total Reviews</span>
            <p className="text-2xl font-black text-stone-900">{analytics.totalReviews}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Pending Complaints</span>
            <p className="text-2xl font-black text-amber-600">{analytics.pendingComplaints}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Resolved Complaints</span>
            <p className="text-2xl font-black text-emerald-600">{analytics.resolvedComplaints}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'complaints' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Customer Complaints Queue ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reviews' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Customer Reviews & Ratings ({branchReviews.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading complaints...</div>
      ) : activeTab === 'complaints' ? (
        complaints.length === 0 ? (
          <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
            No complaints currently in queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complaints.map((c) => (
              <div
                key={c.complaintId}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                    <div>
                      <span className="font-bold text-rose-600 text-xs uppercase block">{c.category}</span>
                      <h3 className="font-black text-stone-900 text-sm">Order Ref: {c.orderNumber}</h3>
                      <p className="text-[11px] text-stone-500">
                        Customer: {c.customerName} ({c.customerPhone})
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-2xl mb-4 leading-relaxed">
                    "{c.description}"
                  </p>

                  {c.resolutionNotes && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl mb-4 text-xs">
                      <span className="font-bold text-emerald-900 block mb-1">Supervisor Resolution:</span>
                      <p className="text-emerald-800 leading-relaxed">{c.resolutionNotes}</p>
                      <span className="text-[10px] text-emerald-600 mt-1 block">
                        Resolved by {c.resolvedByName || 'Supervisor'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  {c.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(c.complaintId, 'IN_PROGRESS')}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" /> Mark In Progress
                    </button>
                  )}

                  {c.status !== 'RESOLVED' && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setShowResolveModal(true);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve & Close Ticket
                    </button>
                  )}

                  {c.status === 'RESOLVED' && (
                    <span className="text-xs font-bold text-emerald-600">✓ Ticket Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Reviews tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branchReviews.map((r) => (
            <div key={r.reviewId} className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-900">{r.customerName}</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-stone-600 italic mb-3">"{r.comment}"</p>
              <div className="flex justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-2">
                <span>Ref: {r.orderNumber}</span>
                <span>{new Date(r.reviewDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Notes Modal */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-1">Resolve Customer Complaint</h3>
            <p className="text-xs text-stone-500 mb-4">
              Issue: {selectedComplaint.category} (Ref: {selectedComplaint.orderNumber})
            </p>
            <form onSubmit={handleResolveComplaint} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Mandatory Resolution Notes / Solution</label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Apologized to customer, dispatched replacement pizza and provided 20% discount coupon for future order."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm & Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
