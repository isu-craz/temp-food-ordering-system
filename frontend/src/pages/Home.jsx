import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Truck,
  Clock,
  Star,
  LogIn,
  LayoutDashboard,
  UtensilsCrossed,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'OPS_MANAGER':
        return '/branches';
      case 'BRANCH_MANAGER':
        return '/kitchen-queue';
      case 'RIDER':
        return '/rider-portal';
      case 'SUPERVISOR':
        return '/supervisor';
      case 'CUSTOMER':
      default:
        return '/order';
    }
  };

  const dashboardLink = getDashboardPath(user?.role);

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-stone-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Background Image with Dark Gradient */}
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop&q=80"
          alt="Spice Avenue Food"
          className="w-full h-full object-cover scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/85 to-stone-900/60 z-10" />

      {/* Main Intro Area */}
      <div className="relative z-20 max-w-4xl mx-auto my-auto w-full text-center flex flex-col items-center">
        {/* Welcome Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/90 text-white text-xs font-extrabold uppercase tracking-wider mb-6 shadow-xl shadow-orange-600/20 backdrop-blur-md">
          <Flame className="w-4 h-4 text-amber-300" /> Welcome to Spice Avenue
        </div>

        {/* Main Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
          Gourmet Food, <br />
          <span className="text-orange-500">Delivered Hot & Fresh.</span>
        </h1>

        {/* Simple Intro Description */}
        <p className="text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Experience gourmet woodfired pizzas, handcrafted burgers, and authentic biryani with real-time kitchen order fulfillment and fast branch delivery.
        </p>

        {/* Action Buttons: Smart Routing based on Authentication */}
        {isAuthenticated ? (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={dashboardLink}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-2xl shadow-orange-600/30 transition-all flex items-center gap-2 text-sm hover:scale-105"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/order"
              className="px-6 py-4 bg-stone-900/80 hover:bg-stone-800 text-stone-200 font-bold rounded-2xl border border-stone-700 transition-all flex items-center gap-2 text-sm backdrop-blur-sm"
            >
              <UtensilsCrossed className="w-4 h-4 text-orange-400" />
              <span>Explore Food Menu</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-2xl shadow-orange-600/30 transition-all flex items-center gap-2 text-sm hover:scale-105"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In to Access Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-4 bg-stone-900/80 hover:bg-stone-800 text-stone-200 font-bold rounded-2xl border border-stone-700 transition-all flex items-center gap-2 text-sm backdrop-blur-sm"
            >
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span>Register Account</span>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Highlights Bar */}
      <div className="relative z-20 max-w-5xl mx-auto w-full pt-4 border-t border-stone-800/60 flex flex-wrap items-center justify-between text-xs text-stone-400 font-medium gap-4">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-500" />
          <span>Multi-Branch Delivery Network</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>4.9/5 Rating across all branches</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <span>Real-time Order Fulfillment</span>
        </div>
      </div>
    </div>
  );
}
