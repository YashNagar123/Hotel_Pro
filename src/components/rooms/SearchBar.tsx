import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { Calendar, Users, Home, Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: () => void;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, compact = false }) => {
  const { checkIn, checkOut, guests, roomType, setCheckIn, setCheckOut, setGuests, setRoomType } =
    useBooking();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    } else {
      navigate('/rooms');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`bg-white rounded-xl shadow-lg border border-stone-200/80 p-4 sm:p-5 ${
        compact ? 'max-w-4xl' : 'max-w-5xl'
      } mx-auto`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Check-In Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            Check-In
          </label>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (new Date(e.target.value) >= new Date(checkOut)) {
                const nextDay = new Date(e.target.value);
                nextDay.setDate(nextDay.getDate() + 1);
                setCheckOut(nextDay.toISOString().split('T')[0]);
              }
            }}
            required
            className="w-full px-3 py-2 text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800 focus:bg-white transition-all font-mono"
          />
        </div>

        {/* Check-Out Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            Check-Out
          </label>
          <input
            type="date"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800 focus:bg-white transition-all font-mono"
          />
        </div>

        {/* Guests Count */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-700" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800 focus:bg-white transition-all"
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={5}>5+ Guests</option>
          </select>
        </div>

        {/* Room Category & Search Button */}
        <div className="space-y-1 flex flex-col justify-end">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Home className="w-3.5 h-3.5 text-amber-700" />
                Suite Tier
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3 py-2 text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800 focus:bg-white transition-all"
              >
                <option value="all">All Suites & Villas</option>
                <option value="deluxe">Deluxe Ocean Suite</option>
                <option value="executive">Executive Suite</option>
                <option value="villa">Private Garden Villa</option>
                <option value="penthouse">Grand Royal Penthouse</option>
              </select>
            </div>

            <div className="self-end">
              <button
                type="submit"
                className="h-[38px] px-5 bg-stone-900 text-white font-medium text-sm rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
