import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiBooking, bookingsAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  CheckCircle,
  Calendar,
  Users,
  Printer,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building,
} from 'lucide-react';

export const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!id) return;
      try {
        const res = await bookingsAPI.getById(id);
        setBooking(res.booking);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to retrieve booking confirmation';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-2xl font-serif font-semibold text-stone-900">Booking Reference Not Found</h2>
        <p className="text-xs text-stone-600">{error || 'Please check your booking ID or sign in.'}</p>
        <Link
          to="/my-bookings"
          className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg"
        >
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-800">
          <CheckCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
          Reservation Confirmed
        </span>
        <h1 className="text-3xl font-serif font-semibold text-stone-900">
          We Look Forward to Welcoming You
        </h1>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          A confirmation record has been generated and stored in your guest portal.
        </p>
      </div>

      {/* Main Confirmation Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Reference Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <span className="text-xs text-stone-500 block uppercase tracking-wider">
              Booking Reference Number
            </span>
            <span className="text-2xl font-mono font-bold text-stone-900 tracking-wider">
              {booking.bookingReference}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={booking.bookingStatus} />
            <button
              onClick={handlePrint}
              className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              title="Print Confirmation Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room & Stay Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-xs text-stone-500 block uppercase tracking-wider">
              Reserved Accommodation
            </span>
            <div className="flex gap-4">
              {booking.roomImage && (
                <img
                  src={booking.roomImage}
                  alt={booking.roomType}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                />
              )}
              <div>
                <h3 className="text-sm font-serif font-semibold text-stone-900">
                  {booking.roomType}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Room #{booking.roomNumber}</p>
                <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>{booking.guestsCount} Guests</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-100 text-xs">
            <span className="text-stone-500 block uppercase tracking-wider">Stay Schedule</span>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-800" /> Check-In:
                </span>
                <strong className="font-mono text-stone-900">{booking.checkInDate} (3:00 PM)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-800" /> Check-Out:
                </span>
                <strong className="font-mono text-stone-900">{booking.checkOutDate} (11:00 AM)</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200/60">
                <span className="text-stone-600">Stay Duration:</span>
                <span className="font-semibold text-stone-900">
                  {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="space-y-2 border-t border-stone-100 pt-5 text-xs">
          <span className="text-stone-500 block uppercase tracking-wider font-semibold">
            Guest Details
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-700">
            <div>
              <span className="text-stone-400 block">Name:</span>
              <strong className="text-stone-900 font-medium">{booking.guestName}</strong>
            </div>
            <div>
              <span className="text-stone-400 block">Email:</span>
              <span className="text-stone-900">{booking.guestEmail}</span>
            </div>
            <div>
              <span className="text-stone-400 block">Phone:</span>
              <span className="text-stone-900">{booking.guestPhone}</span>
            </div>
          </div>
          {booking.specialRequests && (
            <div className="pt-2 text-stone-600">
              <span className="text-stone-400 block">Special Requests:</span>
              <p className="italic">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 border-t border-stone-100 pt-5 text-xs">
          <span className="text-stone-500 block uppercase tracking-wider font-semibold">
            Price Breakdown
          </span>
          <div className="space-y-1.5 text-stone-600">
            <div className="flex justify-between">
              <span>
                Room Tariff (${booking.pricePerNight} × {booking.nights} nights)
              </span>
              <span className="font-mono tabular-nums text-stone-900">${booking.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Resort Hospitality Fee (12%)</span>
              <span className="font-mono tabular-nums text-stone-900">${booking.taxesAndFees}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Price</span>
              <span className="font-mono tabular-nums text-base">${booking.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Check-In Instructions */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs text-stone-600">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <Building className="w-4 h-4 text-amber-800" />
            <span>Check-in Instructions & Arrival</span>
          </div>
          <p className="leading-relaxed">
            Please present this booking reference ({booking.bookingReference}) and a valid government ID
            at the front desk upon arrival. Complimentary valet parking is available at the resort entrance.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            to="/my-bookings"
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors text-center shadow-sm"
          >
            Manage in My Bookings
          </Link>
          <Link
            to="/rooms"
            className="w-full sm:w-auto px-5 py-2.5 border border-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <span>Book Another Stay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
