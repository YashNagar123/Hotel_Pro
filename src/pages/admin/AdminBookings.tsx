import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiBooking, adminAPI, bookingsAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  X,
  ArrowLeft,
  AlertCircle,
  Users,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState<ApiBooking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getBookings();
      setBookings(res.bookings);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve bookings';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCheckIn = async (id: string, ref: string) => {
    try {
      await adminAPI.checkIn(id);
      setActionMessage(`Check-in recorded for reservation ${ref}`);
      await loadBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check-in failed';
      alert(message);
    }
  };

  const handleCheckout = async (id: string, ref: string) => {
    try {
      await adminAPI.checkout(id);
      setActionMessage(`Checkout recorded for reservation ${ref}. Room cleared for housekeeping turnover.`);
      await loadBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      alert(message);
    }
  };

  const handleCancel = async (id: string, ref: string) => {
    const reason = window.prompt(`Enter reason to cancel reservation ${ref}:`, 'Admin cancelled per guest request');
    if (!reason) return;

    try {
      await bookingsAPI.cancel(id, reason);
      setActionMessage(`Reservation ${ref} cancelled.`);
      await loadBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cancellation failed';
      alert(message);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = b.bookingReference.toLowerCase().includes(q);
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchEmail = b.guestEmail.toLowerCase().includes(q);
      const matchRoom = b.roomNumber.toLowerCase().includes(q) || b.roomType.toLowerCase().includes(q);
      return matchRef || matchName || matchEmail || matchRoom;
    }
    return true;
  });

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
            All Guest Reservations & Operational Actions
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Audit digital reservation records, process guest check-in / checkout timestamps, and manage stay states.
          </p>
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, guest, or room..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          {['all', 'confirmed', 'checked_in', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`py-1.5 px-3 text-xs font-medium rounded-md whitespace-nowrap transition-colors capitalize ${
                statusFilter === tab
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Master Reservations Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CalendarCheck className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500">No reservations found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room Reserved</th>
                  <th className="py-3 px-4">Dates & Nights</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {b.bookingReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="block text-stone-900 font-medium">{b.guestName}</strong>
                      <span className="text-[11px] text-stone-400">{b.guestEmail}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800">Room #{b.roomNumber}</span>
                      <span className="text-stone-500 block text-[11px]">{b.roomType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-700">
                      <div>{b.checkInDate} → {b.checkOutDate}</div>
                      <span className="text-stone-400 font-sans">
                        {b.nights} {b.nights === 1 ? 'night' : 'nights'} · {b.guestsCount} guests
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold tabular-nums text-stone-900">
                      ${b.totalPrice}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.bookingStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 text-[11px] border border-stone-200 text-stone-700 rounded hover:bg-stone-50 transition-colors"
                        >
                          Details
                        </button>
                        {b.bookingStatus === 'confirmed' && (
                          <button
                            onClick={() => handleCheckIn(b.id, b.bookingReference)}
                            className="px-2.5 py-1 text-[11px] bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors"
                          >
                            Check-In
                          </button>
                        )}
                        {b.bookingStatus === 'checked_in' && (
                          <button
                            onClick={() => handleCheckout(b.id, b.bookingReference)}
                            className="px-2.5 py-1 text-[11px] bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
                          >
                            Checkout
                          </button>
                        )}
                        {b.bookingStatus === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(b.id, b.bookingReference)}
                            className="px-2.5 py-1 text-[11px] text-rose-600 border border-rose-200 rounded hover:bg-rose-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] text-stone-500 uppercase tracking-wider">
                  Reservation Record
                </span>
                <h3 className="text-base font-mono font-bold text-stone-900">
                  {selectedBooking.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div>
                  <span className="text-stone-400 block">Status:</span>
                  <StatusBadge status={selectedBooking.bookingStatus} />
                </div>
                <div>
                  <span className="text-stone-400 block">Total Due/Paid:</span>
                  <strong className="text-stone-900 font-mono text-sm">
                    ${selectedBooking.totalPrice}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Check-In Date:</span>
                  <strong className="text-stone-800 font-mono">{selectedBooking.checkInDate}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Check-Out Date:</span>
                  <strong className="text-stone-800 font-mono">{selectedBooking.checkOutDate}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-stone-400 uppercase tracking-wider block font-semibold text-[10px]">
                  Guest Information
                </span>
                <p className="text-stone-900 font-semibold">{selectedBooking.guestName}</p>
                <p className="text-stone-600">{selectedBooking.guestEmail}</p>
                <p className="text-stone-600">{selectedBooking.guestPhone}</p>
              </div>

              {selectedBooking.specialRequests && (
                <div className="space-y-1">
                  <span className="text-stone-400 uppercase tracking-wider block font-semibold text-[10px]">
                    Special Requests
                  </span>
                  <p className="italic text-stone-700 bg-stone-50 p-2 rounded border border-stone-100">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}

              <div className="space-y-1 pt-2 border-t border-stone-100">
                <span className="text-stone-400 uppercase tracking-wider block font-semibold text-[10px]">
                  Operational Timestamps
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                  <p>Created: {new Date(selectedBooking.createdAt).toLocaleString()}</p>
                  {selectedBooking.checkInAt && (
                    <p className="text-emerald-700">
                      Checked In: {new Date(selectedBooking.checkInAt).toLocaleTimeString()}
                    </p>
                  )}
                  {selectedBooking.checkedOutAt && (
                    <p className="text-stone-900 font-medium">
                      Checked Out: {new Date(selectedBooking.checkedOutAt).toLocaleTimeString()}
                    </p>
                  )}
                  {selectedBooking.cancelledAt && (
                    <p className="text-rose-600">
                      Cancelled: {new Date(selectedBooking.cancelledAt).toLocaleString()} (
                      {selectedBooking.cancellationReason})
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
