import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
          404 Error
        </span>
        <h1 className="text-4xl font-serif font-semibold text-stone-900">
          Page Not Located
        </h1>
        <p className="text-xs text-stone-600 leading-relaxed">
          The requested luxury suite or hotel management page does not exist or may have been moved.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/rooms"
            className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors"
          >
            View Available Suites
          </Link>
        </div>
      </div>
    </div>
  );
};
