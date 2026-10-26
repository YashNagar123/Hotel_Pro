import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { AuthRequest, authenticateToken, requireAdmin, generateToken } from './auth';

export const apiRouter = Router();

// Helper to sanitize user object
function sanitizeUser(user: { id: string; name: string; email: string; role: 'guest' | 'admin'; phone?: string; createdAt: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

// -------------------------------------------------------------
// 1. AUTHENTICATION ROUTES
// -------------------------------------------------------------
apiRouter.post('/auth/register', (req, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email address already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    // Security constraint: public registration is ALWAYS guest role
    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'guest',
      phone: phone?.trim(),
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return res.status(500).json({ message });
  }
});

apiRouter.post('/auth/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return res.status(500).json({ message });
  }
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  return res.json({ user: sanitizeUser(req.user) });
});

// -------------------------------------------------------------
// 2. ROOM DISCOVERY & SEARCH ROUTES
// -------------------------------------------------------------
apiRouter.get('/rooms', async (req, res: Response) => {
  try {
    const { checkIn, checkOut, guests, minPrice, maxPrice, roomType, amenities, sort } = req.query;

    let rooms = db.getRooms();

    // Only active rooms for guest listing
    rooms = rooms.filter((r) => r.operationalStatus === 'active');

    // Filter by guest capacity
    if (guests) {
      const guestNum = parseInt(guests as string, 10);
      if (!isNaN(guestNum)) {
        rooms = rooms.filter((r) => r.capacity >= guestNum);
      }
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) rooms = rooms.filter((r) => r.pricePerNight >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) rooms = rooms.filter((r) => r.pricePerNight <= max);
    }

    // Filter by roomType
    if (roomType && roomType !== 'all') {
      rooms = rooms.filter((r) => r.roomType.toLowerCase().includes((roomType as string).toLowerCase()));
    }

    // Filter by amenities
    if (amenities) {
      const requiredAmenities = (amenities as string).split(',').map((a) => a.trim().toLowerCase());
      rooms = rooms.filter((r) =>
        requiredAmenities.every((reqA) => r.amenities.some((a) => a.toLowerCase().includes(reqA)))
      );
    }

    // Calculate stay availability if dates are provided
    const checkInStr = checkIn as string;
    const checkOutStr = checkOut as string;

    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        let isAvailable = true;
        let unavailReason: string | undefined = undefined;

        if (checkInStr && checkOutStr) {
          const availCheck = await db.isRoomAvailable(room.id, checkInStr, checkOutStr);
          isAvailable = availCheck.available;
          unavailReason = availCheck.reason;
        }

        return {
          ...room,
          isAvailable,
          unavailReason,
        };
      })
    );

    // Sorting
    let result = [...roomsWithAvailability];
    if (sort === 'price_asc') {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sort === 'capacity_desc') {
      result.sort((a, b) => b.capacity - a.capacity);
    }

    return res.json({
      count: result.length,
      rooms: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching rooms';
    return res.status(500).json({ message });
  }
});

apiRouter.get('/rooms/:id', async (req, res: Response) => {
  try {
    const room = db.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const { checkIn, checkOut } = req.query;
    let isAvailable = room.operationalStatus === 'active';
    let unavailReason: string | undefined;

    if (checkIn && checkOut) {
      const check = await db.isRoomAvailable(room.id, checkIn as string, checkOut as string);
      isAvailable = check.available;
      unavailReason = check.reason;
    }

    return res.json({
      room: {
        ...room,
        isAvailable,
        unavailReason,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching room';
    return res.status(500).json({ message });
  }
});

// -------------------------------------------------------------
// 3. TEMPORARY ROOM HOLDS
// -------------------------------------------------------------
apiRouter.post('/room-holds', async (req, res: Response) => {
  try {
    const { roomId, checkInDate, checkOutDate, guestId, guestEmail } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Room ID, check-in date, and check-out date are required.' });
    }

    const result = await db.createHold({
      roomId,
      guestId,
      guestEmail,
      checkInDate,
      checkOutDate,
      durationMinutes: 10,
    });

    if (!result.success) {
      return res.status(409).json({ message: result.message });
    }

    return res.status(201).json({
      message: 'Room temporarily held for 10 minutes',
      hold: result.hold,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hold creation failed';
    return res.status(500).json({ message });
  }
});

apiRouter.delete('/room-holds/:id', async (req, res: Response) => {
  try {
    const released = await db.releaseHold(req.params.id);
    return res.json({ success: released });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error releasing hold';
    return res.status(500).json({ message });
  }
});

// -------------------------------------------------------------
// 4. BOOKINGS
// -------------------------------------------------------------
apiRouter.post('/bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { roomId, checkInDate, checkOutDate, guestsCount, specialRequests, guestPhone, holdId } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Room, check-in date, and check-out date are required.' });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ message: 'Check-out date must be later than check-in date.' });
    }

    const result = await db.createBooking({
      guestId: user.id,
      guestName: user.name,
      guestEmail: user.email,
      guestPhone: guestPhone || user.phone || 'N/A',
      specialRequests,
      roomId,
      checkInDate,
      checkOutDate,
      guestsCount: guestsCount || 1,
      holdId,
    });

    if (!result.success) {
      return res.status(409).json({ message: result.message });
    }

    return res.status(201).json({
      message: 'Reservation confirmed successfully!',
      booking: result.booking,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Booking creation failed';
    return res.status(500).json({ message });
  }
});

apiRouter.get('/bookings/my', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const bookings = db.getBookingsByGuestId(user.id);
    return res.json({ bookings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve bookings';
    return res.status(500).json({ message });
  }
});

apiRouter.get('/bookings/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const booking = db.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Role ownership check: only booking owner or admin can view
    if (user.role !== 'admin' && booking.guestId !== user.id) {
      return res.status(403).json({ message: 'Access denied: You do not own this reservation.' });
    }

    return res.json({ booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve booking';
    return res.status(500).json({ message });
  }
});

apiRouter.patch('/bookings/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { reason } = req.body;

    const guestId = user.role === 'admin' ? undefined : user.id;
    const result = db.cancelBooking(req.params.id, guestId, reason);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.json({
      message: 'Booking successfully cancelled.',
      booking: result.booking,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to cancel booking';
    return res.status(500).json({ message });
  }
});

// -------------------------------------------------------------
// 5. ADMINISTRATOR ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/admin/stats', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  try {
    const stats = db.getOperationalStats();
    return res.json({ stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load stats';
    return res.status(500).json({ message });
  }
});

apiRouter.get('/admin/rooms', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  try {
    const rooms = db.getRooms();
    return res.json({ rooms });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve rooms';
    return res.status(500).json({ message });
  }
});

apiRouter.post('/admin/rooms', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      roomNumber,
      roomType,
      title,
      description,
      pricePerNight,
      capacity,
      bedType,
      sizeSqFt,
      view,
      floor,
      amenities,
      images,
      operationalStatus,
    } = req.body;

    if (!roomNumber || !title || !pricePerNight || !capacity) {
      return res.status(400).json({ message: 'Room number, title, price, and capacity are required.' });
    }

    const newRoom = db.createRoom({
      roomNumber: String(roomNumber),
      roomType: roomType || 'Deluxe Suite',
      title,
      description: description || '',
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      bedType: bedType || 'King Bed',
      sizeSqFt: Number(sizeSqFt) || 500,
      view: view || 'Garden View',
      floor: Number(floor) || 1,
      amenities: Array.isArray(amenities) ? amenities : ['High-Speed WiFi', 'Climate Control'],
      images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/room_deluxe_ocean_1793034471458.jpg'],
      operationalStatus: operationalStatus || 'active',
    });

    return res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create room';
    return res.status(500).json({ message });
  }
});

apiRouter.patch('/admin/rooms/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const updated = db.updateRoom(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.json({ message: 'Room updated successfully', room: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update room';
    return res.status(500).json({ message });
  }
});

apiRouter.delete('/admin/rooms/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const deleted = db.deleteRoom(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.json({ message: 'Room deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete room';
    return res.status(500).json({ message });
  }
});

apiRouter.get('/admin/bookings', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  try {
    const bookings = db.getBookings().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ count: bookings.length, bookings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve bookings';
    return res.status(500).json({ message });
  }
});

apiRouter.patch('/admin/bookings/:id/check-in', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const result = db.checkInBooking(req.params.id);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.json({ message: 'Guest successfully checked in', booking: result.booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Check-in failed';
    return res.status(500).json({ message });
  }
});

apiRouter.patch('/admin/bookings/:id/checkout', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const result = db.checkoutBooking(req.params.id);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.json({ message: 'Guest successfully checked out', booking: result.booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return res.status(500).json({ message });
  }
});

apiRouter.get('/admin/users', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  try {
    const users = db.getUsers().map((u) => {
      const reservationCount = db.getBookingsByGuestId(u.id).length;
      return {
        ...sanitizeUser(u),
        reservationCount,
      };
    });
    return res.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load users';
    return res.status(500).json({ message });
  }
});
