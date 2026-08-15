import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('customer.john@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const authData = await login(email, password);
      // Route based on role
      switch (authData.role) {
        case 'BRANCH_MANAGER':
          navigate('/kitchen-queue');
          break;
        case 'OPS_MANAGER':
        case 'ADMIN':
          navigate('/branches');
          break;
        case 'RIDER':
          navigate('/rider-portal');
          break;
        case 'SUPERVISOR':
          navigate('/supervisor');
          break;
        case 'CUSTOMER':
        default:
          navigate('/order');
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickSwitch = (newEmail) => {
    setEmail(newEmail);
    setPassword('Password123!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="md:col-span-7 bg-white p-8 border border-stone-200 rounded-3xl shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-stone-900">Welcome Back</h1>
            <p className="text-sm text-stone-600">Sign in to access your Spice Avenue account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="name@spiceavenue.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-orange-600/20 transition-all text-sm mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-stone-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:underline">
              Create Customer Account
            </Link>
          </p>
        </div>

        {/* Right Viva Quick-Login Box */}
        <div className="md:col-span-5 bg-stone-100 border border-stone-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-orange-600" />
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">Viva 1-Click Role Switcher</h2>
          </div>
          <p className="text-xs text-stone-600 mb-4">
            Click any test user below to load credentials instantly for viva demonstration:
          </p>

          <div className="space-y-2">
            {[
              { role: 'Customer (M3, M6)', email: 'customer.john@gmail.com', name: 'John Doe' },
              { role: 'Branch Manager (M2, M4)', email: 'manager.colombo@spiceavenue.com', name: 'Colombo Mgr' },
              { role: 'Delivery Rider (M5)', email: 'rider.kamal@spiceavenue.com', name: 'Kamal (Rider)' },
              { role: 'CS Supervisor (M6)', email: 'supervisor@spiceavenue.com', name: 'Ann Supervisor' },
              { role: 'Operations Manager (M1)', email: 'ops@spiceavenue.com', name: 'Ops Director' },
              { role: 'System Admin', email: 'admin@spiceavenue.com', name: 'Admin Root' },
            ].map((acc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => quickSwitch(acc.email)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                  email === acc.email
                    ? 'bg-orange-50 border-orange-400 text-orange-900 font-bold'
                    : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div>
                  <p className="font-bold">{acc.role}</p>
                  <p className="text-[11px] text-stone-500 font-mono">{acc.email}</p>
                </div>
                {email === acc.email && <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
