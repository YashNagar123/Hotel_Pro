import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, CalendarCheck, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Single text wordmark */}
          <Link
            to="/"
            className="text-2xl font-serif font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-amber-800 transition-colors"
          >
            Hotel Pro
          </Link>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <Link
              to="/rooms"
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 ${
                isActive('/rooms') ? 'text-stone-900 font-semibold' : ''
              }`}
            >
              Rooms & Suites
            </Link>
            <a
              href="#amenities"
              onClick={(e) => {
                if (location.pathname !== '/') {
                  e.preventDefault();
                  navigate('/#amenities');
                }
              }}
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
            >
              The Experience
            </a>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/my-bookings') ? 'text-stone-900 font-semibold' : ''
                }`}
              >
                My Reservations
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 text-amber-800 font-semibold ${
                  isActive('/admin') ? 'underline underline-offset-4' : ''
                }`}
              >
                Admin Console
              </Link>
            )}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 text-sm font-medium text-stone-800 hover:text-stone-900 py-1.5 px-3 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center text-xs font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="whitespace-nowrap">{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-20">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs text-stone-500">Signed in as</p>
                        <p className="text-sm font-medium text-stone-900 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-xs text-amber-800 font-medium capitalize">
                          {user?.role} Account
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                        >
                          <Shield className="w-4 h-4 text-stone-500" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      >
                        <CalendarCheck className="w-4 h-4 text-stone-500" />
                        My Reservations
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        Guest Profile
                      </Link>

                      <div className="border-t border-stone-100 mt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/rooms"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shadow-sm"
                >
                  Book a Stay
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-800 hover:text-amber-800"
          >
            Rooms & Suites
          </Link>
          <Link
            to="/my-bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-800 hover:text-amber-800"
          >
            My Reservations
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-amber-800 hover:text-amber-900 font-semibold"
            >
              Admin Console
            </Link>
          )}
          {isAuthenticated ? (
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-900">{user?.name}</p>
                <p className="text-xs text-stone-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="text-xs text-rose-600 font-medium py-1.5 px-3 border border-rose-200 rounded-md"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-sm font-medium text-stone-700 bg-stone-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-sm font-medium text-white bg-stone-900 rounded-lg"
              >
                Book a Stay
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
