import React, { useEffect, useState, useMemo } from 'react';
import { ApiRoom, roomsAPI } from '../services/api';
import { RoomCard } from '../components/rooms/RoomCard';
import { useBooking } from '../context/BookingContext';
import { SearchBar } from '../components/rooms/SearchBar';
import { SlidersHorizontal, RefreshCcw, CheckSquare, Square } from 'lucide-react';

const COMMON_AMENITIES = [
  'Oceanfront Balcony',
  'Private Plunge Pool',
  'Deep Soaking Tub',
  'Artisan Breakfast Included',
  'Free Ultra-Speed WiFi',
  'Spa Access',
  'Bose Acoustic System',
];

export const Rooms: React.FC = () => {
  const { checkIn, checkOut, guests, roomType, setRoomType } = useBooking();
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minCapacity, setMinCapacity] = useState<number>(guests || 1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roomsAPI.getAll({
        checkIn,
        checkOut,
        guests: minCapacity,
        maxPrice,
        roomType: roomType === 'all' ? undefined : roomType,
        amenities: selectedAmenities.length > 0 ? selectedAmenities.join(',') : undefined,
        sort: sortBy !== 'default' ? sortBy : undefined,
      });
      setRooms(res.rooms);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load rooms';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [checkIn, checkOut, minCapacity, maxPrice, roomType, selectedAmenities, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setMaxPrice(1000);
    setMinCapacity(1);
    setSelectedAmenities([]);
    setRoomType('all');
    setSortBy('default');
  };

  const availableCount = useMemo(() => {
    return rooms.filter((r) => r.isAvailable !== false).length;
  }, [rooms]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
          Hotel Pro Collection
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-stone-900">
          Suites, Residences & Villas
        </h1>
        <p className="text-sm text-stone-600">
          Select stay dates below to verify live suite availability with automated double-booking prevention.
        </p>
      </div>

      {/* Top Search & Dates Bar */}
      <SearchBar onSearch={fetchRooms} />

      {/* Main Grid: Filters + Room Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between pb-2 border-b border-stone-200">
          <span className="text-sm font-medium text-stone-700">
            {rooms.length} {rooms.length === 1 ? 'Suite' : 'Suites'} Found ({availableCount} Available)
          </span>
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-stone-100 rounded-lg text-stone-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`space-y-6 bg-white p-6 rounded-xl border border-stone-200 ${
            showFiltersMobile ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
              Filter By
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Suite Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Suite Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:border-amber-700"
            >
              <option value="all">All Suite Types</option>
              <option value="deluxe">Deluxe Ocean Suite</option>
              <option value="executive">Executive Suite</option>
              <option value="villa">Garden Villa</option>
              <option value="penthouse">Penthouse Suite</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700 uppercase tracking-wider">Max Price</span>
              <span className="font-mono font-medium text-stone-900">${maxPrice}/night</span>
            </div>
            <input
              type="range"
              min="300"
              max="1200"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-stone-900"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono">
              <span>$300</span>
              <span>$1,200</span>
            </div>
          </div>

          {/* Min Capacity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Guest Capacity
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMinCapacity(num)}
                  className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                    minCapacity === num
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Filter */}
          <div className="space-y-2.5 pt-2 border-t border-stone-100">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              Amenities
            </label>
            <div className="space-y-2">
              {COMMON_AMENITIES.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className="flex items-center gap-2 text-xs text-left text-stone-700 hover:text-stone-900 w-full"
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-amber-800 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-300 shrink-0" />
                    )}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Room Listings Column */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sorting & Result Counts Bar */}
          <div className="hidden lg:flex items-center justify-between pb-3 border-b border-stone-200 text-sm">
            <span className="text-stone-600">
              Showing <strong className="text-stone-900">{rooms.length}</strong> suites (
              <span className="text-emerald-700 font-medium">{availableCount} available</span> for selected
              dates)
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-stone-500 uppercase tracking-wider">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs py-1.5 px-3 bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
              >
                <option value="default">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="capacity_desc">Capacity: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-stone-200 rounded-xl h-80" />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && rooms.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-stone-200 space-y-3">
              <h3 className="text-lg font-serif font-semibold text-stone-900">
                No Suites Match Your Criteria
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try expanding your price range, reducing guest count, or clearing selected amenities.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Room Cards Grid */}
          {!loading && !error && rooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
