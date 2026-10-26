import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { ApiRoom, roomsAPI, bookingsAPI } from '../services/api';
import {
  Calendar,
  Users,
  ShieldCheck,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, quickLogin } = useAuth();
  const {
    checkIn,
    checkOut,
    guests,
    activeHold,
    holdRemainingSeconds,
    calculateNights,
    clearHold,
  } = useBooking();

  const [room, setRoom] = useState<ApiRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [guestName, setGuestName] = useState<string>(user?.name || '');
  const [guestEmail, setGuestEmail] = useState<string>(user?.email || '');
  const [guestPhone, setGuestPhone] = useState<string>(user?.phone || '+1 (555) 012-3456');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (!guestEmail) setGuestEmail(user.email);
      if (user.phone && !guestPhone) setGuestPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    async function loadHeldRoom() {
      const roomIdToFetch = activeHold?.roomId || 'room_101';
      try {
        const res = await roomsAPI.getById(roomIdToFetch, checkIn, checkOut);
        setRoom(res.room);
      } catch (err: unknown) {
        console.error('Error loading checkout room:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHeldRoom();
  }, [activeHold, checkIn, checkOut]);

  const nights = calculateNights(checkIn, checkOut);
  const pricePerNight = room?.pricePerNight || 380;
  const subtotal = nights * pricePerNight;
  const taxesAndFees = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + taxesAndFees;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    if (!isAuthenticated) {
      setError('Please sign in or use 1-click guest login below to finalize your booking.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await bookingsAPI.create({
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestsCount: guests,
        guestPhone,
        specialRequests,
        holdId: activeHold?.id,
      });

      // Clear hold from client state
      await clearHold();

      // Navigate to confirmation page
      navigate(`/booking-confirmation/${result.booking.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reservation failed. Please check room availability.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
      </div>
    );
  }

  const minutes = Math.floor(holdRemainingSeconds / 60);
  const seconds = holdRemainingSeconds % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <Link
        to={room ? `/rooms/${room.id}` : '/rooms'}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to suite details
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column (2 Cols): Guest Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Final Step · Secure Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900">
              Confirm Your Stay Details
            </h1>
            <p className="text-xs text-stone-600">
              Your room is locked against double-bookings while you complete this form.
            </p>
          </div>

          {/* Authentication Banner if not signed in */}
          {!isAuthenticated && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Account Required to Finalize Reservation</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                You can sign in with your existing account, or use 1-click Guest Demo Login to proceed
                immediately.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => quickLogin('guest')}
                  className="px-3.5 py-1.5 bg-amber-800 text-white text-xs font-medium rounded-lg hover:bg-amber-900 shadow-sm"
                >
                  ⚡ Fast-Fill & Sign In as Guest
                </button>
                <Link
                  to="/login"
                  className="text-xs text-amber-900 font-medium underline hover:text-black"
                >
                  Existing Member Sign In
                </Link>
                <span className="text-xs text-stone-400">·</span>
                <Link
                  to="/register"
                  className="text-xs text-amber-900 font-medium underline hover:text-black"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Guest Information Form */}
          <form
            onSubmit={handleConfirmBooking}
            className="bg-white rounded-xl border border-stone-200 p-6 space-y-6"
          >
            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
              1. Primary Guest Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Alexander Hayes"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+1 (555) 014-9921"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-stone-700">
                Special Requests or Arrival Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Quiet floor requested, arriving late around 8 PM, high-floor preference..."
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
              />
              <span className="text-[11px] text-stone-400">
                Special requests are subject to availability upon check-in.
              </span>
            </div>

            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3 pt-4">
              2. Hotel Reservation Guarantee
            </h2>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Pay Upon Arrival or Card on File:</strong> No prepayment required today. Your
                  reservation is confirmed with guaranteed room availability.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Flexible Cancellation Policy:</strong> Cancel free of charge up to 48 hours prior
                  to your check-in date directly from your guest dashboard.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={submitting || !isAuthenticated}
                className="w-full py-3.5 bg-stone-900 text-white font-medium text-sm rounded-lg hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Confirming Reservation...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Confirm & Finalize Reservation (${totalPrice})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Hold Timer */}
        <div className="space-y-6">
          {/* Active Hold Countdown Card */}
          {activeHold && holdRemainingSeconds > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Temporary Hold Timer
                </span>
                <span className="font-mono text-sm bg-amber-200/60 px-2 py-0.5 rounded text-amber-950 tabular-nums">
                  {timerStr}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                This suite is held exclusively for you. Complete reservation before the timer reaches 0 to
                prevent room release.
              </p>
            </div>
          )}

          {/* Order Summary Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
              Reservation Summary
            </h3>

            {room && (
              <div className="flex gap-4">
                <img
                  src={room.images[0]}
                  alt={room.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                />
                <div>
                  <span className="text-[11px] text-amber-800 font-semibold block uppercase">
                    {room.roomType}
                  </span>
                  <h4 className="text-sm font-serif font-semibold text-stone-900">{room.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Room #{room.roomNumber}</p>
                </div>
              </div>
            )}

            {/* Dates & Guests */}
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-800" /> Check-In
                </span>
                <strong className="font-mono text-stone-900">{checkIn}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-800" /> Check-Out
                </span>
                <strong className="font-mono text-stone-900">{checkOut}</strong>
              </div>
              <div className="flex items-center justify-between border-t border-stone-200/60 pt-2">
                <span className="text-stone-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-800" /> Party Size
                </span>
                <span className="text-stone-900 font-medium">{guests} Guests</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs border-t border-stone-100 pt-3">
              <div className="flex justify-between text-stone-600">
                <span>
                  ${pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
                <span className="font-mono tabular-nums text-stone-900">${subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Resort & Municipal Taxes (12%)</span>
                <span className="font-mono tabular-nums text-stone-900">${taxesAndFees}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-stone-900 pt-3 border-t border-stone-200">
                <span>Total Due at Stay</span>
                <span className="font-mono tabular-nums">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
