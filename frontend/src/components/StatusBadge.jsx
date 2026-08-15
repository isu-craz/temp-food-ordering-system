import React from 'react';

export default function StatusBadge({ status }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'READY_FOR_PICKUP':
      case 'READY_FOR_DELIVERY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse';
      case 'DELIVERED':
      case 'PICKED_UP':
      case 'ACTIVE':
      case 'AVAILABLE':
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
      case 'REJECTED':
      case 'INACTIVE':
      case 'OFFLINE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'BUSY':
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
