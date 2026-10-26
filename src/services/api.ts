export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'admin';
  phone?: string;
  createdAt: string;
}

export interface ApiRoom {
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
  isAvailable?: boolean;
  unavailReason?: string;
  createdAt: string;
}

export interface ApiBooking {
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
  checkInDate: string;
  checkOutDate: string;
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
}

export interface ApiRoomHold {
  id: string;
  roomId: string;
  guestId?: string;
  guestEmail?: string;
  checkInDate: string;
  checkOutDate: string;
  expiresAt: string;
  status: 'active' | 'released' | 'converted';
  createdAt: string;
}

export interface OperationalStats {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
  checkedInBookings: number;
  confirmedBookings: number;
  totalBookings: number;
  occupancyRate: number;
  totalRevenue: number;
}

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('hotel_pro_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const authAPI = {
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<{ token: string; user: ApiUser; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: ApiUser; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<{ user: ApiUser }>('/auth/me'),
};

export const roomsAPI = {
  getAll: (params?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    roomType?: string;
    amenities?: string;
    sort?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      if (params.checkIn) query.set('checkIn', params.checkIn);
      if (params.checkOut) query.set('checkOut', params.checkOut);
      if (params.guests) query.set('guests', String(params.guests));
      if (params.minPrice) query.set('minPrice', String(params.minPrice));
      if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
      if (params.roomType && params.roomType !== 'all') query.set('roomType', params.roomType);
      if (params.amenities) query.set('amenities', params.amenities);
      if (params.sort) query.set('sort', params.sort);
    }
    const qStr = query.toString();
    return request<{ count: number; rooms: ApiRoom[] }>(`/rooms${qStr ? `?${qStr}` : ''}`);
  },

  getById: (id: string, checkIn?: string, checkOut?: string) => {
    const query = new URLSearchParams();
    if (checkIn) query.set('checkIn', checkIn);
    if (checkOut) query.set('checkOut', checkOut);
    const qStr = query.toString();
    return request<{ room: ApiRoom }>(`/rooms/${id}${qStr ? `?${qStr}` : ''}`);
  },
};

export const holdsAPI = {
  createHold: (payload: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestId?: string;
    guestEmail?: string;
  }) =>
    request<{ hold: ApiRoomHold; message: string }>('/room-holds', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  releaseHold: (id: string) =>
    request<{ success: boolean }>(`/room-holds/${id}`, {
      method: 'DELETE',
    }),
};

export const bookingsAPI = {
  create: (payload: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    specialRequests?: string;
    guestPhone?: string;
    holdId?: string;
  }) =>
    request<{ booking: ApiBooking; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyBookings: () => request<{ bookings: ApiBooking[] }>('/bookings/my'),

  getById: (id: string) => request<{ booking: ApiBooking }>(`/bookings/${id}`),

  cancel: (id: string, reason?: string) =>
    request<{ booking: ApiBooking; message: string }>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
};

export const adminAPI = {
  getStats: () => request<{ stats: OperationalStats }>('/admin/stats'),

  getRooms: () => request<{ rooms: ApiRoom[] }>('/admin/rooms'),

  createRoom: (payload: Partial<ApiRoom>) =>
    request<{ room: ApiRoom; message: string }>('/admin/rooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateRoom: (id: string, updates: Partial<ApiRoom>) =>
    request<{ room: ApiRoom; message: string }>(`/admin/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteRoom: (id: string) =>
    request<{ message: string }>(`/admin/rooms/${id}`, {
      method: 'DELETE',
    }),

  getBookings: () => request<{ count: number; bookings: ApiBooking[] }>('/admin/bookings'),

  checkIn: (id: string) =>
    request<{ booking: ApiBooking; message: string }>(`/admin/bookings/${id}/check-in`, {
      method: 'PATCH',
    }),

  checkout: (id: string) =>
    request<{ booking: ApiBooking; message: string }>(`/admin/bookings/${id}/checkout`, {
      method: 'PATCH',
    }),

  getUsers: () =>
    request<{ users: (ApiUser & { reservationCount: number })[] }>('/admin/users'),
};
