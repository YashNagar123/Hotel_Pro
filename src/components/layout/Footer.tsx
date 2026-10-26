import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <span className="text-2xl font-serif font-semibold tracking-tight text-white">
              Hotel Pro
            </span>
            <p className="text-sm text-stone-400 leading-relaxed">
              A private coastal sanctuary combining timeless architectural elegance, panoramic ocean
              suites, and tailored hospitality.
            </p>
            <div className="text-xs text-stone-400 space-y-1">
              <p>Standard Check-in: 3:00 PM</p>
              <p>Standard Checkout: 11:00 AM</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              Concierge & Location
            </h4>
            <ul className="text-sm text-stone-400 space-y-2.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>8420 Pacific Coast Way, Ocean Bluff, CA 90265</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+1 (800) 555-4683</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>reservations@hotelpro.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Front Desk: 24 Hours / 7 Days</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              Guest Services
            </h4>
            <ul className="text-sm text-stone-400 space-y-2">
              <li>
                <Link to="/rooms" className="hover:text-white transition-colors">
                  Suites & Penthouse Collection
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition-colors">
                  Retrieve & Manage Booking
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Guest Account Access
                </Link>
              </li>
              <li>
                <a href="#amenities" className="hover:text-white transition-colors">
                  Thermal Baths & Dining
                </a>
              </li>
            </ul>
          </div>

          {/* Policies & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              Hotel Policies
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed">
              Flexible cancellation up to 48 hours prior to arrival date. Instant confirmation with
              secure server-side concurrency lock and zero double-booking guarantee.
            </p>
            <div className="pt-2 text-xs text-stone-400">
              <span className="text-stone-300 font-medium">Hotel Pro Property Management System</span>
              <p>Version 1.0 · MERN Architecture</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Hotel Pro. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Non-Smoking Property</span>
            <span aria-hidden="true">·</span>
            <span>Valet Parking</span>
            <span aria-hidden="true">·</span>
            <span>PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
