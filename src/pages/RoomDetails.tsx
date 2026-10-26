import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ApiRoom, roomsAPI, holdsAPI } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Maximize2,
  Bed,
  Compass,
  Building,
  Check,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    checkIn,
    checkOut,
    guests,
    setCheckIn,
    setCheckOut,
    setGuests,
    calculateNights,
    startHold,
    activeHold,
  } = useBooking();

  const [room, setRoom] = useState<ApiRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [holding, setHolding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const nights = calculateNights(checkIn, checkOut);

  useEffect(() => {
    async function loadRoom() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await roomsAPI.getById(id, checkIn, checkOut);
        setRoom(res.room);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load suite details';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadRoom();
  }, [id, checkIn, checkOut]);

  const handleHoldAndBook = async () => {
    if (!room) return;
    setHolding(true);
    setError(null);

    try {
      // 1. Create a 10-minute temporary hold with atomic server-side lock
      const holdRes = await holdsAPI.createHold({
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestId: user?.id,
        guestEmail: user?.email,
      });

      startHold(holdRes.hold);
      // 2. Navigate straight to checkout review
      navigate('/checkout');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not reserve room. Please try other dates.';
      setError(message);
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-xl font-serif font-semibold text-stone-900">Suite Not Available</h2>
        <p className="text-xs text-stone-600">{error || 'The requested room could not be found.'}</p>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Browse available suites
        </Link>
      </div>
    );
  }

  const subtotal = nights * room.pricePerNight;
  const taxesAndFees = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + taxesAndFees;

  const isAvailable = room.isAvailable !== false && room.operationalStatus === 'active';
  const isHeldByMe = activeHold?.roomId === room.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back navigation */}
      <Link
        to="/rooms"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to all accommodations
      </Link>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column (2 Cols): Photo Gallery & Suite Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={room.images[selectedPhotoIndex] || room.images[0]}
                alt={room.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="text-xs px-3 py-1 rounded bg-stone-900/80 backdrop-blur-md text-white font-medium">
                  {room.roomType} · Room {room.roomNumber}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {room.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {room.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedPhotoIndex === idx
                        ? 'border-amber-800 scale-102 ring-1 ring-amber-800'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Suite Title & Specs strip */}
          <div className="space-y-4 border-b border-stone-200 pb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Residence Overview
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-stone-900">
              {room.title}
            </h1>

            {/* Architectural Specs Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs text-stone-700">
              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <Users className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <span className="text-stone-500 block">Occupancy</span>
                  <strong className="font-semibold text-stone-900">{room.capacity} Guests</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <Maximize2 className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <span className="text-stone-500 block">Living Area</span>
                  <strong className="font-semibold text-stone-900">{room.sizeSqFt} sq ft</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <Bed className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <span className="text-stone-500 block">Bed Setup</span>
                  <strong className="font-semibold text-stone-900">{room.bedType}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <Compass className="w-4 h-4 text-amber-800 shrink-0" />
                <div>
                  <span className="text-stone-500 block">Orientation</span>
                  <strong className="font-semibold text-stone-900">{room.view}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 border-b border-stone-200 pb-8">
            <h2 className="text-lg font-serif font-semibold text-stone-900">
              Architectural Concept & Ambiance
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed font-light">
              {room.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-500 pt-2">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Floor {room.floor}
              </span>
              <span aria-hidden="true">·</span>
              <span>Soundproof Triple Glazing</span>
              <span aria-hidden="true">·</span>
              <span>Daily Housekeeping & Turn-Down</span>
            </div>
          </div>

          {/* All Amenities */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-semibold text-stone-900">
              Suite Amenities & Inclusions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-stone-200 text-xs text-stone-800"
                >
                  <Check className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Contiguous Purchase Module */}
        <div className="sticky top-28 bg-white rounded-2xl border border-stone-200 shadow-md p-6 space-y-6">
          <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
            <div>
              <span className="text-xs text-stone-500">Rate from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-stone-900 tabular-nums">
                  ${room.pricePerNight}
                </span>
                <span className="text-xs text-stone-500">/ night</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-700 font-semibold block">Best Rate Guarantee</span>
              <span className="text-[11px] text-stone-400">Taxes calculated below</span>
            </div>
          </div>

          {/* Dates & Guests Selector */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-800" /> Check-In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-800" /> Check-Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-800" /> Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:bg-white focus:outline-none"
              >
                {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Guest' : 'Guests'} (Max {room.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 pt-2 border-t border-stone-100 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>
                ${room.pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="font-mono tabular-nums text-stone-900">${subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>State & Resort Taxes (12%)</span>
              <span className="font-mono tabular-nums text-stone-900">${taxesAndFees}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Estimated Stay</span>
              <span className="font-mono tabular-nums">${totalPrice}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Action Button */}
          <div>
            {isAvailable || isHeldByMe ? (
              <button
                onClick={handleHoldAndBook}
                disabled={holding}
                className="w-full py-3 bg-stone-900 text-white font-medium text-sm rounded-lg hover:bg-stone-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {holding ? (
                  <span>Securing Temporary Hold...</span>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Reserve & Hold for 10 Min</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-stone-200 text-stone-500 font-medium text-sm rounded-lg cursor-not-allowed text-center"
              >
                {room.unavailReason || 'Unavailable for Selected Dates'}
              </button>
            )}
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Free cancellation up to 48h prior to check-in. No upfront charge.
            </p>
          </div>

          {/* Concurrency Guarantee */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 flex items-start gap-2.5 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-medium text-stone-900">Hold Protection</strong>
              <span>
                Clicking Reserve locks this suite for 10 minutes, preventing conflicting reservations
                while you enter guest details.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
