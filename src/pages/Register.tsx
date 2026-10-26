import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await register({
        name,
        email,
        password,
        phone,
      });
      navigate('/rooms');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
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
            Hotel Pro Guest Registration
          </span>
          <h1 className="text-2xl font-serif font-semibold text-stone-900">
            Create Your Guest Account
          </h1>
          <p className="text-xs text-stone-500">
            Join to manage your hotel reservations, unlock temporary holds, and view receipts.
          </p>
        </div>

        {/* Security Rule Note */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            Public registration automatically assigns a verified Guest role. Administrative access is
            restricted to authorized hotel staff.
          </span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Julian Ross"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="julian@example.com"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 019-3829"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Create Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-stone-900 text-white font-medium text-xs rounded-lg hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>Already registered? </span>
          <Link to="/login" className="font-semibold text-amber-800 hover:text-stone-900 underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
