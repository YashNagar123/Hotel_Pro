import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { Clock, ShieldAlert, ArrowRight, X } from 'lucide-react';

export const HoldTimerBanner: React.FC = () => {
  const { activeHold, holdRemainingSeconds, clearHold } = useBooking();
  const navigate = useNavigate();

  if (!activeHold || holdRemainingSeconds <= 0) {
    return null;
  }

  const minutes = Math.floor(holdRemainingSeconds / 60);
  const seconds = holdRemainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = holdRemainingSeconds < 120;

  return (
    <div
      className={`border-b transition-colors px-4 py-2.5 text-xs ${
        isLowTime
          ? 'bg-amber-100/90 border-amber-300 text-amber-950'
          : 'bg-stone-900 border-stone-800 text-stone-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isLowTime ? (
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
          ) : (
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            <strong className="font-semibold">Temporary Room Hold Active:</strong> Stay from{' '}
            <span className="font-mono">{activeHold.checkInDate}</span> to{' '}
            <span className="font-mono">{activeHold.checkOutDate}</span> is locked for your checkout.
          </span>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-black/10 tabular-nums">
            {formattedTime}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/checkout')}
            className={`flex items-center gap-1.5 font-medium px-3 py-1 rounded transition-colors ${
              isLowTime
                ? 'bg-amber-800 text-white hover:bg-amber-900'
                : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
            }`}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearHold}
            title="Release hold"
            className="p-1 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
