import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'guest' | 'admin';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  title: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  sizeSqFt: number;
  view: string;
  floor: number;
  amenities: string[];
  images: string[];
  operationalStatus: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  roomImage: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  pricePerNight: number;
  subtotal: number;
  taxesAndFees: number;
  totalPrice: number;
  bookingStatus: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  checkInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomHold {
  id: string;
  roomId: string;
  guestId?: string;
  guestEmail?: string;
  checkInDate: string;
  checkOutDate: string;
  expiresAt: string; // ISO string
  status: 'active' | 'released' | 'converted';
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  rooms: Room[];
  bookings: Booking[];
  roomHolds: RoomHold[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'hotel_pro_db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    rooms: [],
    bookings: [],
    roomHolds: [],
  };

  private lock: boolean = false;

  constructor() {
    this.init();
  }

  private async acquireLock(): Promise<() => void> {
    while (this.lock) {
      await new Promise((res) => setTimeout(res, 20));
    }
    this.lock = true;
    return () => {
      this.lock = false;
    };
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing database, seeding fallback:', err);
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  private seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
    const guestPasswordHash = bcrypt.hashSync('Guest123!', 10);
    const now = new Date().toISOString();

    const users: User[] = [
      {
        id: 'usr_admin_1',
        name: 'Victoria Stone',
        email: 'admin@hotelpro.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        phone: '+1 (555) 019-2834',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_guest_1',
        name: 'Alexander Hayes',
        email: 'guest@example.com',
        passwordHash: guestPasswordHash,
        role: 'guest',
        phone: '+1 (555) 014-9921',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_guest_2',
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        passwordHash: guestPasswordHash,
        role: 'guest',
        phone: '+1 (555) 018-4720',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const rooms: Room[] = [
      {
        id: 'room_101',
        roomNumber: '101',
        roomType: 'Deluxe Ocean Suite',
        title: 'Azure Horizon Deluxe Suite',
        description:
          'Perched directly above the coastline with unobstructed azure ocean vistas. Features a custom king bed dressed in 400-thread Egyptian cotton, a private teak balcony with sun loungers, and an Italian marble en-suite bathroom with a freestanding soaking tub.',
        pricePerNight: 380,
        capacity: 2,
        bedType: 'King Bed',
        sizeSqFt: 620,
        view: 'Oceanfront Panoramic',
        floor: 1,
        amenities: [
          'Oceanfront Balcony',
          'Free Ultra-Speed WiFi',
          'Deep Soaking Tub',
          'King Bed',
          'Nespresso Bar',
          'Artisan Breakfast Included',
          'Spa Access',
          'Smart Room Climate',
        ],
        images: [
          '/src/assets/images/room_deluxe_ocean_1793034471458.jpg',
          '/src/assets/images/hero_hotel_resort_1793034471010.jpg',
        ],
        operationalStatus: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'room_201',
        roomNumber: '201',
        roomType: 'Executive Suite',
        title: 'Metropolitan Executive Suite',
        description:
          'An expansive modern suite designed for discerning travelers. Features floor-to-ceiling soundproof glass walls, a dedicated lounge with velvet sofa and marble table, an executive work desk with ergonomic seating, and priority club access.',
        pricePerNight: 490,
        capacity: 3,
        bedType: 'California King + Daybed',
        sizeSqFt: 840,
        view: 'Skyline & Bay View',
        floor: 2,
        amenities: [
          'Panoramic Bay Views',
          'Executive Club Access',
          'Designer Lounge Area',
          'Rainfall Dual Shower',
          'High-Speed Mesh WiFi',
          'Stocked Gourmet Minibar',
          '24h Dedicated Concierge',
        ],
        images: [
          '/src/assets/images/room_executive_suite_1793034471925.jpg',
          '/src/assets/images/hotel_amenities_spa_1793034472431.jpg',
        ],
        operationalStatus: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'room_301',
        roomNumber: '301',
        roomType: 'Garden Villa',
        title: 'Sanctuary Private Garden Villa',
        description:
          'Secluded tropical oasis surrounded by verdant hibiscus and frangipani. Offers complete privacy with an exclusive temperature-controlled plunge pool, open-air sun deck, outdoor rainfall shower, and handcrafted teak furnishings.',
        pricePerNight: 680,
        capacity: 4,
        bedType: '2 King Beds',
        sizeSqFt: 1250,
        view: 'Private Tropical Garden & Pool',
        floor: 1,
        amenities: [
          'Private Plunge Pool',
          'Outdoor Rainfall Shower',
          'Secluded Sun Deck',
          'Tropical Garden Enclosure',
          'Personal Butler Service',
          'Daily In-Villa Breakfast',
          'Complimentary Thermal Spa Pass',
        ],
        images: [
          '/src/assets/images/room_garden_villa_1793034472248.jpg',
          '/src/assets/images/hotel_amenities_spa_1793034472431.jpg',
        ],
        operationalStatus: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'room_102',
        roomNumber: '102',
        roomType: 'Deluxe Ocean Suite',
        title: 'Pacific Breeze Terrace Suite',
        description:
          'Bright and breezy coastal haven on the resort ground terrace. Walk directly onto manicured lawn paths toward the infinity pool and beach bar. Equipped with premium acoustic insulation and sound systems.',
        pricePerNight: 350,
        capacity: 2,
        bedType: 'King Bed',
        sizeSqFt: 580,
        view: 'Pool & Partial Ocean',
        floor: 1,
        amenities: [
          'Direct Terrace Access',
          'King Bed',
          'Rainfall Shower',
          'Bose Acoustic System',
          'High-Speed WiFi',
          'Organic Toiletries',
        ],
        images: [
          '/src/assets/images/room_deluxe_ocean_1793034471458.jpg',
          '/src/assets/images/hero_hotel_resort_1793034471010.jpg',
        ],
        operationalStatus: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'room_401',
        roomNumber: '401',
        roomType: 'Penthouse Suite',
        title: 'The Grand Royal Penthouse',
        description:
          'The pinnacle of luxury at Hotel Pro. Occupying the entire fourth-floor wing with a 360-degree wrap-around terrace, private heated jacuzzi under the stars, full dining salon for eight, and private elevator entry.',
        pricePerNight: 980,
        capacity: 5,
        bedType: 'Master King + Second Queen',
        sizeSqFt: 1900,
        view: '360° Coastal Panoramic',
        floor: 4,
        amenities: [
          'Private Wrap-Around Jacuzzi',
          'Dedicated Private Elevator',
          'Full Dining Salon',
          'Sommelier Wine Cellar',
          'Chauffeured Airport Transfer',
          'Unlimited Spa Treatments',
        ],
        images: [
          '/src/assets/images/room_executive_suite_1793034471925.jpg',
          '/src/assets/images/hero_hotel_resort_1793034471010.jpg',
        ],
        operationalStatus: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'room_202',
        roomNumber: '202',
        roomType: 'Executive Suite',
        title: 'Harbor Crest Corner Suite',
        description:
          'Architectural corner suite with double-aspect windows catching the morning sunrise over the yacht marina. High ceilings and custom walnut paneling create an atmosphere of classic luxury.',
        pricePerNight: 460,
        capacity: 3,
        bedType: 'King Bed + Sofa Bed',
        sizeSqFt: 790,
        view: 'Marina & Coastal Bay',
        floor: 2,
        amenities: [
          'Double-Aspect Windows',
          'Deep Soaking Tub',
          'Executive Desk',
          'Espresso Station',
          'High-Speed WiFi',
          'Evening Turn-Down Service',
        ],
        images: [
          '/src/assets/images/room_deluxe_ocean_1793034471458.jpg',
          '/src/assets/images/hotel_amenities_spa_1793034472431.jpg',
        ],
        operationalStatus: 'maintenance',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const bookings: Booking[] = [
      {
        id: 'bk_sample_1',
        bookingReference: 'HP-90412-2026',
        guestId: 'usr_guest_1',
        guestName: 'Alexander Hayes',
        guestEmail: 'guest@example.com',
        guestPhone: '+1 (555) 014-9921',
        specialRequests: 'Quiet room on upper floor preferred. Late check-in at 8 PM.',
        roomId: 'room_101',
        roomNumber: '101',
        roomType: 'Deluxe Ocean Suite',
        roomImage: '/src/assets/images/room_deluxe_ocean_1793034471458.jpg',
        checkInDate: '2026-11-01',
        checkOutDate: '2026-11-05',
        nights: 4,
        guestsCount: 2,
        pricePerNight: 380,
        subtotal: 1520,
        taxesAndFees: 182,
        totalPrice: 1702,
        bookingStatus: 'confirmed',
        createdAt: '2026-10-20T14:20:00.000Z',
        updatedAt: '2026-10-20T14:20:00.000Z',
      },
      {
        id: 'bk_sample_2',
        bookingReference: 'HP-81204-2026',
        guestId: 'usr_guest_2',
        guestName: 'Elena Rostova',
        guestEmail: 'elena.rostova@example.com',
        guestPhone: '+1 (555) 018-4720',
        specialRequests: 'Celebrating anniversary, champagne request.',
        roomId: 'room_301',
        roomNumber: '301',
        roomType: 'Garden Villa',
        roomImage: '/src/assets/images/room_garden_villa_1793034472248.jpg',
        checkInDate: '2026-10-24',
        checkOutDate: '2026-10-28',
        nights: 4,
        guestsCount: 2,
        pricePerNight: 680,
        subtotal: 2720,
        taxesAndFees: 326,
        totalPrice: 3046,
        bookingStatus: 'checked_in',
        checkInAt: '2026-10-24T15:30:00.000Z',
        createdAt: '2026-10-18T10:15:00.000Z',
        updatedAt: '2026-10-24T15:30:00.000Z',
      },
      {
        id: 'bk_sample_3',
        bookingReference: 'HP-74199-2026',
        guestId: 'usr_guest_1',
        guestName: 'Alexander Hayes',
        guestEmail: 'guest@example.com',
        guestPhone: '+1 (555) 014-9921',
        roomId: 'room_201',
        roomNumber: '201',
        roomType: 'Executive Suite',
        roomImage: '/src/assets/images/room_executive_suite_1793034471925.jpg',
        checkInDate: '2026-09-10',
        checkOutDate: '2026-09-14',
        nights: 4,
        guestsCount: 2,
        pricePerNight: 490,
        subtotal: 1960,
        taxesAndFees: 235,
        totalPrice: 2195,
        bookingStatus: 'completed',
        checkInAt: '2026-09-10T14:10:00.000Z',
        checkedOutAt: '2026-09-14T11:00:00.000Z',
        createdAt: '2026-08-25T09:00:00.000Z',
        updatedAt: '2026-09-14T11:00:00.000Z',
      },
    ];

    this.data = {
      users,
      rooms,
      bookings,
      roomHolds: [],
    };
  }

  // --- User Operations ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  // --- Room Operations ---
  public getRooms(): Room[] {
    return this.data.rooms;
  }

  public getRoomById(id: string): Room | undefined {
    return this.data.rooms.find((r) => r.id === id);
  }

  public createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Room {
    const now = new Date().toISOString();
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      ...roomData,
      createdAt: now,
      updatedAt: now,
    };
    this.data.rooms.push(newRoom);
    this.persist();
    return newRoom;
  }

  public updateRoom(id: string, updates: Partial<Room>): Room | undefined {
    const roomIndex = this.data.rooms.findIndex((r) => r.id === id);
    if (roomIndex === -1) return undefined;
    const now = new Date().toISOString();
    this.data.rooms[roomIndex] = {
      ...this.data.rooms[roomIndex],
      ...updates,
      updatedAt: now,
    };
    this.persist();
    return this.data.rooms[roomIndex];
  }

  public deleteRoom(id: string): boolean {
    const initialLen = this.data.rooms.length;
    this.data.rooms = this.data.rooms.filter((r) => r.id !== id);
    if (this.data.rooms.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Room Holds (Temporary Hold with Concurrency Lock & TTL) ---
  public async purgeExpiredHolds() {
    const now = new Date();
    const beforeCount = this.data.roomHolds.length;
    this.data.roomHolds = this.data.roomHolds.filter(
      (hold) => hold.status === 'active' && new Date(hold.expiresAt) > now
    );
    if (this.data.roomHolds.length !== beforeCount) {
      this.persist();
    }
  }

  public async isRoomAvailable(
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string,
    currentGuestId?: string
  ): Promise<{ available: boolean; reason?: string }> {
    await this.purgeExpiredHolds();

    const room = this.getRoomById(roomId);
    if (!room) return { available: false, reason: 'Room not found' };
    if (room.operationalStatus !== 'active') {
      return { available: false, reason: `Room is currently under ${room.operationalStatus}` };
    }

    const reqStart = new Date(checkIn).getTime();
    const reqEnd = new Date(checkOut).getTime();

    if (isNaN(reqStart) || isNaN(reqEnd) || reqStart >= reqEnd) {
      return { available: false, reason: 'Invalid check-in/check-out dates' };
    }

    // Check confirmed or checked-in bookings that overlap:
    // Overlap condition: existingCheckIn < requestedCheckOut && existingCheckOut > requestedCheckIn
    for (const b of this.data.bookings) {
      if (b.roomId !== roomId) continue;
      if (b.id === excludeBookingId) continue;
      if (b.bookingStatus === 'cancelled' || b.bookingStatus === 'completed') continue;

      const bStart = new Date(b.checkInDate).getTime();
      const bEnd = new Date(b.checkOutDate).getTime();

      if (bStart < reqEnd && bEnd > reqStart) {
        return {
          available: false,
          reason: `Reserved for overlapping dates (${b.checkInDate} to ${b.checkOutDate})`,
        };
      }
    }

    // Check active temporary holds:
    const now = new Date();
    for (const h of this.data.roomHolds) {
      if (h.roomId !== roomId) continue;
      if (h.status !== 'active') continue;
      if (new Date(h.expiresAt) <= now) continue;
      // If held by current guest, allow them to complete booking!
      if (currentGuestId && h.guestId === currentGuestId) continue;

      const hStart = new Date(h.checkInDate).getTime();
      const hEnd = new Date(h.checkOutDate).getTime();

      if (hStart < reqEnd && hEnd > reqStart) {
        return {
          available: false,
          reason: 'Currently temporarily held by another guest during checkout',
        };
      }
    }

    return { available: true };
  }

  public async createHold(params: {
    roomId: string;
    guestId?: string;
    guestEmail?: string;
    checkInDate: string;
    checkOutDate: string;
    durationMinutes?: number;
  }): Promise<{ success: boolean; hold?: RoomHold; message?: string }> {
    const unlock = await this.acquireLock();
    try {
      const availability = await this.isRoomAvailable(
        params.roomId,
        params.checkInDate,
        params.checkOutDate,
        undefined,
        params.guestId
      );

      if (!availability.available) {
        return { success: false, message: availability.reason || 'Room is not available' };
      }

      const durationMs = (params.durationMinutes || 10) * 60 * 1000;
      const expiresAt = new Date(Date.now() + durationMs).toISOString();

      // Release any previous active holds for this user & room
      if (params.guestId) {
        this.data.roomHolds.forEach((h) => {
          if (h.guestId === params.guestId && h.roomId === params.roomId && h.status === 'active') {
            h.status = 'released';
          }
        });
      }

      const newHold: RoomHold = {
        id: `hold_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        roomId: params.roomId,
        guestId: params.guestId,
        guestEmail: params.guestEmail,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        expiresAt,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      this.data.roomHolds.push(newHold);
      this.persist();

      return { success: true, hold: newHold };
    } finally {
      unlock();
    }
  }

  public async releaseHold(holdId: string): Promise<boolean> {
    const hold = this.data.roomHolds.find((h) => h.id === holdId);
    if (hold && hold.status === 'active') {
      hold.status = 'released';
      this.persist();
      return true;
    }
    return false;
  }

  // --- Booking Operations with Atomic Concurrency Protection ---
  public async createBooking(bookingData: {
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    holdId?: string;
  }): Promise<{ success: boolean; booking?: Booking; message?: string }> {
    const unlock = await this.acquireLock();
    try {
      const room = this.getRoomById(bookingData.roomId);
      if (!room) {
        return { success: false, message: 'Room not found' };
      }

      // Server-side availability validation (Critical concurrency rule)
      const availability = await this.isRoomAvailable(
        bookingData.roomId,
        bookingData.checkInDate,
        bookingData.checkOutDate,
        undefined,
        bookingData.guestId
      );

      if (!availability.available) {
        return {
          success: false,
          message: availability.reason || 'This room is not available for the requested dates.',
        };
      }

      // Calculate stay duration and trusted server-side pricing
      const start = new Date(bookingData.checkInDate);
      const end = new Date(bookingData.checkOutDate);
      const diffTime = end.getTime() - start.getTime();
      const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

      const pricePerNight = room.pricePerNight;
      const subtotal = nights * pricePerNight;
      const taxesAndFees = Math.round(subtotal * 0.12);
      const totalPrice = subtotal + taxesAndFees;

      const now = new Date().toISOString();
      const refNumber = Math.floor(10000 + Math.random() * 90000);
      const bookingReference = `HP-${refNumber}-${new Date().getFullYear()}`;

      const newBooking: Booking = {
        id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        bookingReference,
        guestId: bookingData.guestId,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        specialRequests: bookingData.specialRequests,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        roomImage: room.images[0] || '',
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        nights,
        guestsCount: bookingData.guestsCount,
        pricePerNight,
        subtotal,
        taxesAndFees,
        totalPrice,
        bookingStatus: 'confirmed',
        createdAt: now,
        updatedAt: now,
      };

      this.data.bookings.push(newBooking);

      // If there was an active hold for this user & room, mark converted
      this.data.roomHolds.forEach((h) => {
        if (
          h.roomId === room.id &&
          (h.id === bookingData.holdId || h.guestId === bookingData.guestId) &&
          h.status === 'active'
        ) {
          h.status = 'converted';
        }
      });

      this.persist();

      return { success: true, booking: newBooking };
    } finally {
      unlock();
    }
  }

  public getBookings(): Booking[] {
    return this.data.bookings;
  }

  public getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find((b) => b.id === id || b.bookingReference === id);
  }

  public getBookingsByGuestId(guestId: string): Booking[] {
    return this.data.bookings
      .filter((b) => b.guestId === guestId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public cancelBooking(
    bookingId: string,
    guestId?: string,
    reason?: string
  ): { success: boolean; message?: string; booking?: Booking } {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    if (guestId && booking.guestId !== guestId) {
      return { success: false, message: 'Unauthorized to cancel this booking' };
    }

    if (booking.bookingStatus === 'cancelled') {
      return { success: false, message: 'Booking is already cancelled' };
    }

    if (booking.bookingStatus === 'completed') {
      return { success: false, message: 'Cannot cancel a completed stay' };
    }

    if (booking.bookingStatus === 'checked_in') {
      return { success: false, message: 'Guest has already checked in. Contact front desk.' };
    }

    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason || 'Guest requested cancellation';
    booking.updatedAt = new Date().toISOString();

    this.persist();
    return { success: true, booking };
  }

  public checkInBooking(bookingId: string): { success: boolean; message?: string; booking?: Booking } {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    if (booking.bookingStatus === 'cancelled') {
      return { success: false, message: 'Cannot check in a cancelled booking' };
    }

    if (booking.bookingStatus === 'completed') {
      return { success: false, message: 'Booking is already completed' };
    }

    const now = new Date().toISOString();
    booking.bookingStatus = 'checked_in';
    booking.checkInAt = now;
    booking.updatedAt = now;

    this.persist();
    return { success: true, booking };
  }

  public checkoutBooking(bookingId: string): { success: boolean; message?: string; booking?: Booking } {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    if (booking.bookingStatus !== 'checked_in') {
      return { success: false, message: 'Can only checkout reservations that are checked in' };
    }

    const now = new Date().toISOString();
    booking.bookingStatus = 'completed';
    booking.checkedOutAt = now;
    booking.updatedAt = now;

    this.persist();
    return { success: true, booking };
  }

  public getOperationalStats() {
    const totalRooms = this.data.rooms.length;
    const activeRooms = this.data.rooms.filter((r) => r.operationalStatus === 'active').length;
    const maintenanceRooms = this.data.rooms.filter((r) => r.operationalStatus === 'maintenance').length;

    const checkedInBookings = this.data.bookings.filter((b) => b.bookingStatus === 'checked_in').length;
    const confirmedBookings = this.data.bookings.filter((b) => b.bookingStatus === 'confirmed').length;
    const totalBookings = this.data.bookings.length;

    const totalRevenue = this.data.bookings
      .filter((b) => b.bookingStatus !== 'cancelled')
      .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

    const occupancyRate = totalRooms > 0 ? Math.round((checkedInBookings / totalRooms) * 100) : 0;

    return {
      totalRooms,
      activeRooms,
      maintenanceRooms,
      checkedInBookings,
      confirmedBookings,
      totalBookings,
      occupancyRate,
      totalRevenue,
    };
  }
}

export const db = new Database();
