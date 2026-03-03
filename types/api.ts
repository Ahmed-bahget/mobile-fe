export interface User {
  id: string;
  username: string;
  email?: string;
  mobile?: string;
  role: 'player' | 'pitch_owner';
}

export interface RegisterRequest {
  username: string;
  email?: string;
  mobile?: string;
  password: string;
  role?: 'player' | 'pitch_owner';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user?: User;
}

export interface Pitch {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  pricePerHour: number;
  size: string;
  surface: string;
  amenities: string[];
  images: string[];
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  pitchId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  price: number;
}

export interface Booking {
  id: string;
  pitchId: string;
  pitch?: Pitch;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CreatePitchRequest {
  name: string;
  description: string;
  location: string;
  address: string;
  pricePerHour: number;
  size: string;
  surface: string;
  amenities: string[];
}

export interface CreateBookingRequest {
  pitchId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
