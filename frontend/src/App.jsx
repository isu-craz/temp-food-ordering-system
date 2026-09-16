import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BranchManagement from './pages/branch/BranchManagement';
import MenuManagement from './pages/menu/MenuManagement';
import CustomerOrdering from './pages/ordering/CustomerOrdering';
import CustomerOrders from './pages/ordering/CustomerOrders';
import KitchenQueue from './pages/fulfillment/KitchenQueue';
import RiderPortal from './pages/delivery/RiderPortal';
import SupervisorPortal from './pages/complaint/SupervisorPortal';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-orange-100 selection:text-orange-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* System Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Customer Routes (Member 3 & Member 6) */}
              <Route
                path="/order"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <CustomerOrdering />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <CustomerOrders />
                  </ProtectedRoute>
                }
              />

              {/* Member 1: Branch Management (Ops Manager / Admin) */}
              <Route
                path="/branches"
                element={
                  <ProtectedRoute allowedRoles={['OPS_MANAGER', 'ADMIN', 'BRANCH_MANAGER']}>
                    <BranchManagement />
                  </ProtectedRoute>
                }
              />

              {/* Member 2: Menu Management (Branch Manager / Admin) */}
              <Route path="/menu-management" element={<MenuManagement />} />
              <Route path="/menu-admin" element={<MenuManagement />} />
              <Route path="/menu" element={<MenuManagement />} />

              {/* Member 4: Kitchen Fulfillment Queue (Branch Manager / Admin) */}
              <Route path="/kitchen-queue" element={<KitchenQueue />} />
              <Route path="/kitchen" element={<KitchenQueue />} />

              {/* Member 5: Delivery Rider Portal (Rider / Admin) */}
              <Route
                path="/rider-portal"
                element={
                  <ProtectedRoute allowedRoles={['RIDER', 'ADMIN']}>
                    <RiderPortal />
                  </ProtectedRoute>
                }
              />

              {/* Member 6: CS Supervisor & Feedback Portal */}
              <Route
                path="/supervisor"
                element={
                  <ProtectedRoute allowedRoles={['SUPERVISOR', 'ADMIN', 'OPS_MANAGER']}>
                    <SupervisorPortal />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-semibold text-stone-700">Spice Avenue Enterprise Food Platform</p>
              <p className="text-[11px] text-stone-400 mt-1">
                SE2030 Software Engineering Coursework • SLIIT Year 2 Semester 1
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
