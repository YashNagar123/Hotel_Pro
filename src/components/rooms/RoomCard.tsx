import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiRoom } from '../../services/api';
import { Users, Maximize2, Bed, Check } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

interface RoomCardProps {
  room: ApiRoom;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();
  const { checkIn, checkOut, calculateNights } = useBooking();
  const nights = calculateNights(checkIn, checkOut);
  const totalStayPrice = nights * room.pricePerNight;

  const isAvailable = room.isAvailable !== false && room.operationalStatus === 'active';

  return (
    <div className="group bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Visual Asset Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={room.images[0] || '/src/assets/images/room_deluxe_ocean_1793034471458.jpg'}
          alt={room.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Subtle status tag (unboxed or subtle tag) */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs px-2.5 py-1 rounded bg-stone-900/85 backdrop-blur-sm text-stone-100 font-medium`}
          >
            {room.roomType}
          </span>
        </div>

        {/* Availability Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px] flex items-center justify-center p-4">
            <span className="text-white text-xs font-semibold uppercase tracking-wider text-center">
              {room.unavailReason || 'Unavailable for Selected Dates'}
            </span>
          </div>
        )}
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata string with typographic dot separators */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              Up to {room.capacity} Guests
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
              {room.sizeSqFt} sq ft
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-stone-400" />
              {room.bedType}
            </span>
          </div>

          <h3 className="text-lg font-serif font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
            <Link to={`/rooms/${room.id}`}>{room.title}</Link>
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
            {room.description}
          </p>

          {/* Key Amenities Highlights */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-600">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-amber-700" />
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Booking CTA */}
        <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-stone-900 tabular-nums">
                ${room.pricePerNight}
              </span>
              <span className="text-xs text-stone-500">/ night</span>
            </div>
            {checkIn && checkOut && (
              <p className="text-[11px] text-stone-600 font-mono">
                ${totalStayPrice} total ({nights} {nights === 1 ? 'night' : 'nights'})
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/rooms/${room.id}`)}
              disabled={!isAvailable}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isAvailable
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              {isAvailable ? 'View & Reserve' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
