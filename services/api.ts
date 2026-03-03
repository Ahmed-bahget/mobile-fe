import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Pitch,
  Booking,
  CreatePitchRequest,
  CreateBookingRequest,
  TimeSlot,
} from '@/types/api';

const API_BASE_URL = 'http://31.97.76.53:3000';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    if (!this.token) return;

    await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ access_token: this.token }),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async getPitches(): Promise<Pitch[]> {
    return this.request<Pitch[]>('/pitches');
  }

  async getPitch(id: string): Promise<Pitch> {
    return this.request<Pitch>(`/pitches/${id}`);
  }

  async getMyPitches(): Promise<Pitch[]> {
    return this.request<Pitch[]>('/pitches/my-pitches');
  }

  async createPitch(data: CreatePitchRequest): Promise<Pitch> {
    return this.request<Pitch>('/pitches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePitch(id: string, data: Partial<CreatePitchRequest>): Promise<Pitch> {
    return this.request<Pitch>(`/pitches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async togglePitchStatus(id: string, isActive: boolean): Promise<Pitch> {
    return this.request<Pitch>(`/pitches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async uploadPitchImages(pitchId: string, images: FormData): Promise<string[]> {
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/pitches/${pitchId}/images`, {
      method: 'POST',
      headers,
      body: images,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    return response.json();
  }

  async getAvailableSlots(pitchId: string, date: string): Promise<TimeSlot[]> {
    return this.request<TimeSlot[]>(`/pitches/${pitchId}/slots?date=${date}`);
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings/my-bookings');
  }

  async getPitchBookings(pitchId: string): Promise<Booking[]> {
    return this.request<Booking[]>(`/bookings/pitch/${pitchId}`);
  }

  async cancelBooking(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  }
}

export const apiService = new ApiService();
