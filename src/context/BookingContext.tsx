import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiRoomHold, holdsAPI } from '../services/api';

interface BookingContextType {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  setCheckIn: (val: string) => void;
  setCheckOut: (val: string) => void;
  setGuests: (val: number) => void;
  setRoomType: (val: string) => void;
  activeHold: ApiRoomHold | null;
  holdRemainingSeconds: number;
  startHold: (hold: ApiRoomHold) => void;
  clearHold: () => Promise<void>;
  calculateNights: (startStr?: string, endStr?: string) => number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper to format default dates (tomorrow and +3 days)
function getDefaultDates() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkout = new Date(tomorrow);
  checkout.setDate(checkout.getDate() + 3);

  const format = (d: Date) => d.toISOString().split('T')[0];
  return {
    checkIn: format(tomorrow),
    checkOut: format(checkout),
  };
}

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaults = getDefaultDates();
  const [checkIn, setCheckIn] = useState<string>(defaults.checkIn);
  const [checkOut, setCheckOut] = useState<string>(defaults.checkOut);
  const [guests, setGuests] = useState<number>(2);
  const [roomType, setRoomType] = useState<string>('all');

  const [activeHold, setActiveHold] = useState<ApiRoomHold | null>(() => {
    const saved = localStorage.getItem('hotel_pro_active_hold');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ApiRoomHold;
        if (new Date(parsed.expiresAt) > new Date()) {
          return parsed;
        }
      } catch {
        localStorage.removeItem('hotel_pro_active_hold');
      }
    }
    return null;
  });

  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState<number>(0);

  // Hold expiration countdown
  useEffect(() => {
    if (!activeHold) {
      setHoldRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000)
      );
      setHoldRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem('hotel_pro_active_hold');
        setActiveHold(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHold]);

  const startHold = (hold: ApiRoomHold) => {
    setActiveHold(hold);
    localStorage.setItem('hotel_pro_active_hold', JSON.stringify(hold));
    const remaining = Math.max(0, Math.floor((new Date(hold.expiresAt).getTime() - Date.now()) / 1000));
    setHoldRemainingSeconds(remaining);
  };

  const clearHold = async () => {
    if (activeHold) {
      try {
        await holdsAPI.releaseHold(activeHold.id);
      } catch {
        // Ignored
      }
    }
    setActiveHold(null);
    setHoldRemainingSeconds(0);
    localStorage.removeItem('hotel_pro_active_hold');
  };

  const calculateNights = (startStr = checkIn, endStr = checkOut): number => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s >= e) return 1;
    const diff = e.getTime() - s.getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <BookingContext.Provider
      value={{
        checkIn,
        checkOut,
        guests,
        roomType,
        setCheckIn,
        setCheckOut,
        setGuests,
        setRoomType,
        activeHold,
        holdRemainingSeconds,
        startHold,
        clearHold,
        calculateNights,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
