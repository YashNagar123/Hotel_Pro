import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiBooking, bookingsAPI } from '../services/api';
import { User, Mail, Phone, CalendarCheck, Shield, Clock } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ApiBooking[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await bookingsAPI.getMyBookings();
        setBookings(res.bookings);
      } catch (err) {
        console.error('Error fetching bookings for profile:', err);
      }
    }
    loadStats();
  }, []);

  const upcomingCount = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'completed').length;
  const totalSpent = bookings
    .filter((b) => b.bookingStatus !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="border-b border-stone-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
          Account Overview
        </span>
        <h1 className="text-3xl font-serif font-semibold text-stone-900">
          Guest Profile & Activity
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center text-xl font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">{user?.name}</h2>
              <span className="text-xs font-medium text-amber-800 capitalize block">
                {user?.role} Member
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{user?.phone || 'No phone on record'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="capitalize">Role: {user?.role} Access</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Column (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 text-center space-y-1">
              <span className="text-xs text-stone-500 uppercase tracking-wider block">Upcoming</span>
              <strong className="text-2xl font-serif text-stone-900 font-semibold">{upcomingCount}</strong>
              <span className="text-[11px] text-stone-400 block">Confirmed Stays</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 text-center space-y-1">
              <span className="text-xs text-stone-500 uppercase tracking-wider block">Completed</span>
              <strong className="text-2xl font-serif text-stone-900 font-semibold">{completedCount}</strong>
              <span className="text-[11px] text-stone-400 block">Past Visits</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 text-center space-y-1">
              <span className="text-xs text-stone-500 uppercase tracking-wider block">Total Spent</span>
              <strong className="text-2xl font-serif text-stone-900 font-semibold tabular-nums">
                ${totalSpent}
              </strong>
              <span className="text-[11px] text-stone-400 block">Loyalty Value</span>
            </div>
          </div>

          {/* Hotel Member Perks */}
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-6 space-y-3 text-xs text-stone-700">
            <div className="flex items-center gap-2 text-stone-900 font-semibold">
              <CalendarCheck className="w-4 h-4 text-amber-800" />
              <span>Hotel Pro Member Privileges</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-stone-600 leading-relaxed">
              <li>10-Minute temporary hold locking priority during booking</li>
              <li>Complimentary access to the subterranean thermal baths & dry sauna</li>
              <li>Preferred arrival check-in and luggage valet service</li>
              <li>Free cancellation up to 48 hours prior to check-in date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
