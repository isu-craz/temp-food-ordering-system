import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, LogOut, User, ShoppingBag, ShieldCheck, MapPin, ChefHat, Bike, MessageSquareWarning } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getPortalLinks = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
      case 'OPS_MANAGER':
        return (
          <>
            <Link to="/branches" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
              <MapPin className="w-4 h-4 text-orange-600" /> M1: Branches
            </Link>
            <Link to="/menu-admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
              <UtensilsCrossed className="w-4 h-4 text-orange-600" /> M2: Menus
            </Link>
            <Link to="/supervisor" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
              <MessageSquareWarning className="w-4 h-4 text-orange-600" /> M6: Feedback
            </Link>
          </>
        );
      case 'BRANCH_MANAGER':
        return (
          <>
            <Link to="/menu-admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
              <UtensilsCrossed className="w-4 h-4 text-orange-600" /> M2: Menus
            </Link>
            <Link to="/kitchen-queue" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
              <ChefHat className="w-4 h-4 text-orange-600" /> M4: Kitchen Queue
            </Link>
          </>
        );
      case 'RIDER':
        return (
          <Link to="/rider-portal" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
            <Bike className="w-4 h-4 text-orange-600" /> M5: Rider Portal
          </Link>
        );
      case 'SUPERVISOR':
        return (
          <Link to="/supervisor" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
            <MessageSquareWarning className="w-4 h-4 text-orange-600" /> M6: CS Portal
          </Link>
        );
      case 'CUSTOMER':
      default:
        return (
          <>
            <Link to="/order" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
              <ShoppingBag className="w-4 h-4 text-orange-600" /> Order Food
            </Link>
            <Link to="/my-orders" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-100 text-stone-700">
              My Orders & Feedback
            </Link>
          </>
        );
    }
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20">
                🌶️
              </div>
              <div>
                <span className="font-extrabold text-lg text-stone-900 tracking-tight">Spice Avenue</span>
                <span className="block text-[10px] uppercase font-bold text-orange-600 tracking-wider">Multi-Branch System</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {getPortalLinks()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-stone-900 leading-tight">{user?.fullName}</p>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm shadow-orange-600/30 transition-all"
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
