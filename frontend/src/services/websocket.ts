/**
 * WebSocket Service for Real-time Updates
 */

import { io, Socket } from 'socket.io-client';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:5000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('subscribe', { room: 'general' });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Register all event listeners
    this.socket.on('accident_detected', (data) => {
      this.notifyListeners('accident_detected', data);
    });

    this.socket.on('emergency_alert', (data) => {
      this.notifyListeners('emergency_alert', data);
    });

    this.socket.on('streetlight_update', (data) => {
      this.notifyListeners('streetlight_update', data);
    });

    this.socket.on('detection_update', (data) => {
      this.notifyListeners('detection_update', data);
    });

    this.socket.on('status', (data) => {
      this.notifyListeners('status', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  getStatus() {
    this.emit('get_status');
  }
}

export const wsService = new WebSocketService();

