import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: 'guest' | 'admin') => {
    setSubmitting(true);
    setError(null);
    try {
      await quickLogin(role);
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Quick login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Welcome to Hotel Pro
          </span>
          <h1 className="text-2xl font-serif font-semibold text-stone-900">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-stone-500">
            Access your reservations, manage room holds, and view property services.
          </p>
        </div>

        {/* 1-Click Fast Login for Testing / Review */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2.5">
          <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider block">
            Demo Fast-Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickLogin('guest')}
              className="py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 transition-colors text-center shadow-xs cursor-pointer"
            >
              👤 Guest Demo
              <span className="block text-[10px] text-stone-400 font-normal">Alexander Hayes</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickLogin('admin')}
              className="py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-amber-900 transition-colors text-center shadow-xs cursor-pointer"
            >
              🛡️ Admin Demo
              <span className="block text-[10px] text-stone-400 font-normal">Hotel Manager</span>
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alexander@example.com"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">Password</label>
              <span className="text-[11px] text-stone-400">Min 6 characters</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-stone-900 text-white font-medium text-xs rounded-lg hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-semibold text-amber-800 hover:text-stone-900 underline">
            Register as Guest
          </Link>
        </div>
      </div>
    </div>
  );
};
