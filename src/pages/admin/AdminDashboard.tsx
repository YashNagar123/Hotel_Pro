import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OperationalStats, ApiBooking, adminAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  CalendarCheck,
  DollarSign,
  Percent,
  CheckCircle,
  LogOut,
  Plus,
  Users,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getBookings(),
      ]);
      setStats(statsRes.stats);
      setRecentBookings(bookingsRes.bookings.slice(0, 6));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load administrative data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async (id: string, ref: string) => {
    try {
      await adminAPI.checkIn(id);
      setActionMessage(`Check-in recorded for reservation ${ref}`);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check-in failed';
      alert(message);
    }
  };

  const handleCheckout = async (id: string, ref: string) => {
    try {
      await adminAPI.checkout(id);
      setActionMessage(`Checkout recorded for reservation ${ref}. Room cleared for turnover.`);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      alert(message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Operations Center
            </span>
            <span className="text-xs text-stone-400">/</span>
            <span className="text-xs font-medium text-stone-600">Property Management</span>
          </div>
          <h1 className="text-3xl font-serif font-semibold text-stone-900">
            Hotel Pro Administrative Console
          </h1>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/rooms"
            className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Inventory</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="px-4 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>All Reservations</span>
          </Link>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* KPI Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-wider font-semibold">Occupancy Rate</span>
              <Percent className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-3xl font-serif font-semibold text-stone-900 tabular-nums">
              {stats.occupancyRate}%
            </p>
            <span className="text-[11px] text-stone-400">
              {stats.checkedInBookings} of {stats.totalRooms} rooms occupied
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-wider font-semibold">Active In-House</span>
              <CalendarCheck className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-3xl font-serif font-semibold text-stone-900 tabular-nums">
              {stats.checkedInBookings}
            </p>
            <span className="text-[11px] text-stone-400">
              {stats.confirmedBookings} upcoming confirmed stays
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-wider font-semibold">Inventory Status</span>
              <Building2 className="w-4 h-4 text-stone-700" />
            </div>
            <p className="text-3xl font-serif font-semibold text-stone-900 tabular-nums">
              {stats.activeRooms} / {stats.totalRooms}
            </p>
            <span className="text-[11px] text-amber-800 font-medium">
              {stats.maintenanceRooms} in maintenance turnover
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-wider font-semibold">Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-3xl font-serif font-semibold text-stone-900 tabular-nums">
              ${stats.totalRevenue}
            </p>
            <span className="text-[11px] text-stone-400">Excludes cancelled stays</span>
          </div>
        </div>
      )}

      {/* Operations Table: Front Desk Check-in & Checkout Queue */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-serif font-semibold text-stone-900">
              Front Desk Arrival & Departure Queue
            </h2>
            <p className="text-xs text-stone-500">
              Operational records with server-side check-in and checkout transitions.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-amber-800 hover:text-stone-900 flex items-center gap-1"
          >
            <span>View All Reservations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
          </div>
        ) : recentBookings.length === 0 ? (
          <p className="text-xs text-stone-500 py-6 text-center">No recent bookings recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-y border-stone-100 font-semibold">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operational Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-stone-900">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <strong className="block text-stone-900">{b.guestName}</strong>
                      <span className="text-[11px] text-stone-400">{b.guestEmail}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-800">#{b.roomNumber}</span>
                      <span className="text-stone-500 block text-[11px]">{b.roomType}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                      {b.checkInDate} → {b.checkOutDate}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold tabular-nums text-stone-900">
                      ${b.totalPrice}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.bookingStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(b.id, b.bookingReference)}
                          className="px-3 py-1.5 bg-emerald-700 text-white font-medium text-[11px] rounded hover:bg-emerald-800 transition-colors cursor-pointer"
                        >
                          Check In Guest
                        </button>
                      )}
                      {b.bookingStatus === 'checked_in' && (
                        <button
                          onClick={() => handleCheckout(b.id, b.bookingReference)}
                          className="px-3 py-1.5 bg-stone-900 text-white font-medium text-[11px] rounded hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          Record Checkout
                        </button>
                      )}
                      {b.bookingStatus === 'completed' && (
                        <span className="text-[11px] text-stone-400">Checkout Complete</span>
                      )}
                      {b.bookingStatus === 'cancelled' && (
                        <span className="text-[11px] text-rose-500">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/rooms"
          className="p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-400 transition-all flex items-start gap-4 group"
        >
          <div className="p-3 bg-stone-100 rounded-lg group-hover:bg-amber-100 transition-colors text-stone-800 shrink-0">
            <Building2 className="w-5 h-5 text-stone-900" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 group-hover:text-amber-800">
              Room Inventory Management
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Add rooms, set nightly rates, configure capacity, and toggle maintenance status.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/bookings"
          className="p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-400 transition-all flex items-start gap-4 group"
        >
          <div className="p-3 bg-stone-100 rounded-lg group-hover:bg-amber-100 transition-colors text-stone-800 shrink-0">
            <CalendarCheck className="w-5 h-5 text-stone-900" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 group-hover:text-amber-800">
              Reservations & Lifecycle
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Filter bookings, review guest requests, execute check-ins, checkouts, and cancellations.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-400 transition-all flex items-start gap-4 group"
        >
          <div className="p-3 bg-stone-100 rounded-lg group-hover:bg-amber-100 transition-colors text-stone-800 shrink-0">
            <Users className="w-5 h-5 text-stone-900" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 group-hover:text-amber-800">
              User Accounts & Roles
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Audit registered guests, administrative staff, and reservation history records.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
