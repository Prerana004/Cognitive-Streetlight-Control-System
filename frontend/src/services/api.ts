/**
 * API Service for LumenAI Backend
 * Handles all API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface AccidentAlert {
  id: number;
  timestamp: string;
  confidence: number;
  location?: string;
  video_source?: string;
  status: string;
  severity: string;
}

export interface EmergencyAlert {
  id: number;
  alert_type: string;
  timestamp: string;
  location?: string;
  severity: string;
  status: string;
  description?: string;
  source: string;
}

export interface Streetlight {
  id: number;
  lamp_id: string;
  location: { x: number; y: number };
  group?: string;
  brightness: number;
  status: string;
  power_consumption: number;
  health_score: number;
}

export interface DashboardStats {
  accidents: {
    total: number;
    today: number;
    active: number;
  };
  emergencies: {
    total: number;
    active: number;
    today: number;
  };
  streetlights: {
    total: number;
    active: number;
    inactive: number;
    average_brightness: number;
    total_power_consumption: number;
  };
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(username: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getEnergyStats() {
    return this.request('/dashboard/energy');
  }

  async getRecentActivity() {
    return this.request('/dashboard/recent');
  }

  // Accident Detection
  async getAccidentStatus() {
    return this.request('/accident/status');
  }

  async startAccidentDetection(videoSource?: string, threshold?: number) {
    return this.request('/accident/start', {
      method: 'POST',
      body: JSON.stringify({ video_source: videoSource, threshold }),
    });
  }

  async stopAccidentDetection() {
    return this.request('/accident/stop', {
      method: 'POST',
    });
  }

  async detectImage(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${this.baseURL}/accident/detect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    
    return response.json();
  }

  // Streetlights
  async getStreetlightStatus() {
    return this.request('/streetlight/status');
  }

  async getStreetlights(): Promise<{ lamps: Streetlight[] }> {
    return this.request<{ lamps: Streetlight[] }>('/streetlight/lamps');
  }

  async setStreetlightBrightness(lampId: string, brightness: number) {
    return this.request(`/streetlight/lamps/${lampId}/brightness`, {
      method: 'POST',
      body: JSON.stringify({ brightness }),
    });
  }

  async startStreetlightControl(videoSource?: string) {
    return this.request('/streetlight/start', {
      method: 'POST',
      body: JSON.stringify({ video_source: videoSource }),
    });
  }

  async stopStreetlightControl() {
    return this.request('/streetlight/stop', {
      method: 'POST',
    });
  }

  // Alerts
  async getAlerts(limit = 50, status?: string, severity?: string) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    
    return this.request<{ alerts: EmergencyAlert[] }>(`/alerts?${params}`);
  }

  async getAccidentAlerts(limit = 50) {
    return this.request<{ alerts: AccidentAlert[] }>(
      `/alerts/accident?limit=${limit}`
    );
  }

  async updateAlert(alertId: number, data: Partial<EmergencyAlert>) {
    return this.request(`/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAlertStats() {
    return this.request('/alerts/stats');
  }
}

export const apiService = new ApiService();

