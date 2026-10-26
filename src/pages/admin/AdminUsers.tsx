import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiUser, adminAPI } from '../../services/api';
import { Users, Shield, ArrowLeft, Mail, Calendar, CheckCircle } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<(ApiUser & { reservationCount: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await adminAPI.getUsers();
        setUsers(res.users);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve user accounts';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-semibold text-stone-900">
            User Accounts & Roles Registry
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Audit registered guest accounts, staff roles, and historical reservation activity.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Reservations Made</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-semibold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="block text-stone-900 font-medium">{u.name}</strong>
                          <span className="text-[11px] text-stone-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 font-semibold">
                          <Shield className="w-3.5 h-3.5" />
                          Hotel Administrator
                        </span>
                      ) : (
                        <span className="text-stone-600 font-medium">Verified Guest</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">{u.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-stone-900">
                      {u.reservationCount} {u.reservationCount === 1 ? 'stay' : 'stays'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
