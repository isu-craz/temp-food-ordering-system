import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, UserCheck, Shield, ChevronRight, Receipt } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Get the primary dashboard route for each user role
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

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-stone-900 text-orange-400 border-stone-800';
      case 'OPS_MANAGER':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'BRANCH_MANAGER':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'RIDER':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'SUPERVISOR':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Brand Logo & Title (Navigates to Home) */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              🌶️
            </div>
            <div>
              <span className="font-extrabold text-lg text-stone-900 tracking-tight leading-none block group-hover:text-orange-600 transition-colors">
                Spice Avenue
              </span>
              <span className="text-[10px] uppercase font-extrabold text-orange-600 tracking-wider block mt-0.5">
                Multi-Branch Platform
              </span>
            </div>
          </Link>

          {/* Right: Dashboard Switcher & Styled User Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Single Clean "My Dashboard" button */}
                <Link
                  to={getDashboardPath(user?.role)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md shadow-orange-600/20 hover:from-orange-700 hover:to-orange-800 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-white" />
                  <span>My Dashboard</span>
                </Link>

                {/* My Orders link for Customer */}
                <Link
                  to="/my-orders"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200 transition-all"
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">My Orders</span>
                </Link>

                {/* Stylish User Profile Card */}
                <div className="flex items-center gap-2.5 bg-stone-50 border border-stone-200/80 px-3 py-1.5 rounded-2xl shadow-inner">
                  {/* Avatar Circle with Online Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      {getUserInitials(user?.fullName)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  {/* Name & Role Badge */}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-stone-900 leading-tight">{user?.fullName}</p>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider inline-block mt-0.5 ${getRoleBadgeStyle(
                        user?.role
                      )}`}
                    >
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-stone-200 sm:border-transparent"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-600/30 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
