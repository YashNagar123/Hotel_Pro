import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiRoom, roomsAPI } from '../services/api';
import { SearchBar } from '../components/rooms/SearchBar';
import { RoomCard } from '../components/rooms/RoomCard';
import { ArrowRight, Sparkles, Waves, Utensils, Compass, ShieldCheck } from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredRooms, setFeaturedRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await roomsAPI.getAll();
        setFeaturedRooms(res.rooms.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_hotel_resort_1793034471010.jpg"
            alt="Hotel Pro Luxury Coastal Resort"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-95"
          />
          {/* Measured Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-stone-900/20" />
        </div>

        {/* Top spacer */}
        <div className="relative z-10 pt-16 px-4 max-w-7xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold mb-3 inline-block">
            Ocean Bluff Sanctuary · California
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium text-white tracking-tight max-w-3xl mx-auto leading-tight text-balance">
            Where Coastal Solitude Meets Architectural Refinement
          </h1>
          <p className="mt-4 text-base sm:text-lg text-stone-200 max-w-xl mx-auto font-light leading-relaxed">
            Discover tailored luxury suites, private heated thermal pools, and Michelin-inspired dining
            with guaranteed room availability.
          </p>
        </div>

        {/* Hero Bottom: Search Bar Container */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-10">
          <SearchBar />
        </div>
      </section>

      {/* 2. Key Highlights Adjacency Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-stone-200 text-stone-700">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs">
              <strong className="block font-semibold text-stone-900">Zero Double-Booking</strong>
              <span>Atomic concurrency locks</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Waves className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs">
              <strong className="block font-semibold text-stone-900">Private Ocean Access</strong>
              <span>Exclusive secluded cove</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs">
              <strong className="block font-semibold text-stone-900">10-Minute Hold Guarantee</strong>
              <span>Temporary cart reservation</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs">
              <strong className="block font-semibold text-stone-900">24/7 Butler & Concierge</strong>
              <span>Personalized guest care</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Suites Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Curated Accommodations
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900 mt-1">
              Featured Suites & Private Villas
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-lg">
              Each residence is architecturally oriented toward the horizon, furnished in Scandinavian oak,
              and appointed with fine Egyptian cottons.
            </p>
          </div>
          <Link
            to="/rooms"
            className="flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-amber-800 transition-colors shrink-0"
          >
            <span>View All Accommodations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-xl aspect-[4/3]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* 4. The Experience: Thermal Spa & Dining */}
      <section id="amenities" className="bg-stone-100/70 py-20 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Resort Wellness & Gastronomy
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-medium text-stone-900 leading-tight">
                Subterranean Thermal Baths & Oceanfront Dining
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                Rejuvenate in our subterranean thermal sanctuary carved into coastal bedrock. Naturally heated
                mineral pools, steam aromatherapy chambers, and bespoke restorative rituals provide deep
                sensory stillness.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 text-amber-800 shrink-0">
                    <Waves className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">Thermal Spring Baths</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Temperature-controlled cascading plunge pools and eucalyptus dry saunas open to all guests.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 text-amber-800 shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">Pacific Terrace Restaurant</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Seasonal hyper-local seafood and biodynamic wines served overlooking the sunset surf.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/rooms')}
                  className="px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
                >
                  Reserve Your Suite
                </button>
              </div>
            </div>

            {/* Visual Asset Container */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-stone-200">
              <img
                src="/src/assets/images/hotel_amenities_spa_1793034472431.jpg"
                alt="Hotel Pro Thermal Spa & Heated Baths"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Editorial Guest Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Verified Stays & Distinction
          </span>
          <h2 className="text-3xl font-serif font-medium text-stone-900">
            Loved by Discerning Travelers Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              {'★'.repeat(5)}
            </div>
            <p className="text-sm text-stone-700 italic leading-relaxed">
              "The Azure Horizon Suite exceeded all expectations. Checking in was effortless, the private balcony
              at sunset is unforgettable, and the zero double-booking system meant our reservation was 100% smooth."
            </p>
            <div className="pt-2 border-t border-stone-100 text-xs">
              <p className="font-semibold text-stone-900">Marcus & Claire Vance</p>
              <p className="text-stone-500">Stayed in Deluxe Ocean Suite · October 2026</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              {'★'.repeat(5)}
            </div>
            <p className="text-sm text-stone-700 italic leading-relaxed">
              "As a property manager myself, I was impressed by the Hotel Pro platform. The temporary 10-minute hold
              gave us time to coordinate flights without losing the suite. Simply outstanding service."
            </p>
            <div className="pt-2 border-t border-stone-100 text-xs">
              <p className="font-semibold text-stone-900">Evelyn Sterling</p>
              <p className="text-stone-500">Stayed in Sanctuary Garden Villa · September 2026</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              {'★'.repeat(5)}
            </div>
            <p className="text-sm text-stone-700 italic leading-relaxed">
              "The subterranean thermal baths and morning espresso on the private terrace are unmatched.
              We are already planning our return stay for the holiday season."
            </p>
            <div className="pt-2 border-t border-stone-100 text-xs">
              <p className="font-semibold text-stone-900">David & Saffron Chen</p>
              <p className="text-stone-500">Stayed in Grand Royal Penthouse · August 2026</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
