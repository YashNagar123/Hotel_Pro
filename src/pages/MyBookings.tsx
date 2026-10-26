import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiBooking, bookingsAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Calendar,
  Users,
  AlertTriangle,
  Receipt,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'>('all');

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState<ApiBooking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Change of travel plans');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsAPI.getMyBookings();
      setBookings(res.bookings);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve your reservations';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;

    setActionLoading(true);
    try {
      await bookingsAPI.cancel(cancellingBooking.id, cancelReason);
      setNotification(`Booking ${cancellingBooking.bookingReference} has been cancelled.`);
      setCancellingBooking(null);
      await fetchMyBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not cancel booking';
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'all') return true;
    return b.bookingStatus === filterTab;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Guest Portal
          </span>
          <h1 className="text-3xl font-serif font-semibold text-stone-900">
            My Reservations & Stays
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Review your upcoming arrival schedules, view receipts, and manage active reservations.
          </p>
        </div>
        <Link
          to="/rooms"
          className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors shrink-0 shadow-sm"
        >
          Book Another Suite
        </Link>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Segmented Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl max-w-md">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterTab === 'all'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilterTab('confirmed')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterTab === 'confirmed'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Upcoming ({bookings.filter((b) => b.bookingStatus === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilterTab('checked_in')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterTab === 'checked_in'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterTab === 'completed'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Past Stays
        </button>
        <button
          onClick={() => setFilterTab('cancelled')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterTab === 'cancelled'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredBookings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200 space-y-3">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-semibold text-stone-800">No Reservations Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You currently have no reservations under this filter tab.
          </p>
          <Link
            to="/rooms"
            className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"
          >
            Explore Accommodations
          </Link>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-shadow hover:shadow-sm"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start gap-4">
                {b.roomImage && (
                  <img
                    src={b.roomImage}
                    alt={b.roomType}
                    referrerPolicy="no-referrer"
                    className="w-24 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-stone-900 tracking-wider">
                      {b.bookingReference}
                    </span>
                    <StatusBadge status={b.bookingStatus} />
                  </div>

                  <h3 className="text-base font-serif font-semibold text-stone-900">{b.roomType}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-800" />
                      {b.checkInDate} to {b.checkOutDate} ({b.nights} {b.nights === 1 ? 'night' : 'nights'})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      {b.guestsCount} Guests
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-700 font-semibold tabular-nums">${b.totalPrice}</span>
                  </div>

                  {b.specialRequests && (
                    <p className="text-[11px] text-stone-500 italic">
                      Note: "{b.specialRequests}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                <Link
                  to={`/booking-confirmation/${b.id}`}
                  className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </Link>

                {b.bookingStatus === 'confirmed' && (
                  <button
                    onClick={() => setCancellingBooking(b)}
                    className="px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-semibold text-stone-900">Cancel Reservation</h3>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to cancel reservation{' '}
              <strong className="text-stone-900">{cancellingBooking.bookingReference}</strong> (
              {cancellingBooking.roomType}) for stay dates {cancellingBooking.checkInDate} to{' '}
              {cancellingBooking.checkOutDate}?
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800"
                >
                  <option value="Change of travel plans">Change of travel plans</option>
                  <option value="Booked another date range">Booked another date range</option>
                  <option value="Personal emergency">Personal emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
