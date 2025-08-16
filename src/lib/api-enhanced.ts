// Enhanced API service with data persistence, reconnection, and offline support
import { environment } from '../config/environment';
import { dataPersistence } from './persistence';
import { mockUsers, mockComplaints, mockCustomers } from '../data/mockData';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fromCache?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface NetworkStatus {
  isOnline: boolean;
  lastOnline: number;
  reconnectAttempts: number;
}

class EnhancedApiService {
  private baseUrl: string;
  private isProduction: boolean;
  private demoMode: boolean = false;
  private networkStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    lastOnline: Date.now(),
    reconnectAttempts: 0
  };
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // 2 seconds

  constructor() {
    this.isProduction = environment.isProduction;
    this.baseUrl = environment.apiBaseUrl;
    this.demoMode = environment.forceDemoMode;
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
    
    console.log('🚀 Enhanced API Service initialized');
    console.log('📡 Backend URL:', this.baseUrl);
    console.log('🌐 Network status:', this.networkStatus.isOnline ? 'Online' : 'Offline');
  }

  private setupNetworkMonitoring(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.networkStatus.isOnline = true;
      this.networkStatus.lastOnline = Date.now();
      this.networkStatus.reconnectAttempts = 0;
      console.log('🌐 Network connection restored');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.networkStatus.isOnline = false;
      console.log('🔌 Network connection lost - switching to offline mode');
    });

    // App visibility change (mobile app lifecycle)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('📱 App became visible - checking connection');
        this.checkConnection();
      }
    });
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl + '/health', {
        method: 'GET',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      } as any);
      
      const isOnline = response.ok;
      this.networkStatus.isOnline = isOnline;
      
      if (isOnline) {
        this.networkStatus.lastOnline = Date.now();
        this.networkStatus.reconnectAttempts = 0;
      }
      
      return isOnline;
    } catch (error) {
      this.networkStatus.isOnline = false;
      console.log('🔌 Connection check failed - using cached data');
      return false;
    }
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {},
    cacheKey?: string
  ): Promise<ApiResponse<T>> {
    try {
      // Check if we have cached data first
      if (cacheKey) {
        const cachedData = await dataPersistence.getData(cacheKey);
        if (cachedData && !this.networkStatus.isOnline) {
          console.log('📱 Using cached data (offline):', cacheKey);
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }

      // Try network request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for large data

      // Use Google Apps Script URL directly (ignore the url parameter for endpoints)
      const requestUrl = this.baseUrl;

      const response = await fetch(requestUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      if (cacheKey && data.success) {
        await dataPersistence.saveData(cacheKey, data.data);
      }

      this.networkStatus.isOnline = true;
      this.networkStatus.lastOnline = Date.now();
      this.networkStatus.reconnectAttempts = 0;

      return data;
    } catch (error) {
      console.error('❌ Network request failed:', error);
      
      // Try to use cached data
      if (cacheKey) {
        const cachedData = await dataPersistence.getData(cacheKey);
        if (cachedData) {
          console.log('💾 Using cached data after network failure:', cacheKey);
          return {
            success: true,
            data: cachedData,
            fromCache: true,
            message: 'Data from cache - network unavailable'
          };
        }
      }

      // If it's demo mode or we can't reach backend, use mock data
      if (this.demoMode || !this.isProduction) {
        console.log('🎭 Using mock data (demo mode)');
        return this.getMockData(url);
      }

      this.networkStatus.isOnline = false;
      this.scheduleReconnect();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'Unable to connect to server. Please check your internet connection.'
      };
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.networkStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectTimer = setTimeout(async () => {
      this.networkStatus.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.networkStatus.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      const isOnline = await this.checkConnection();
      if (isOnline) {
        this.syncPendingData();
      } else if (this.networkStatus.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimer = null;
        this.scheduleReconnect();
      }
    }, this.reconnectDelay * Math.pow(2, this.networkStatus.reconnectAttempts)); // Exponential backoff
  }

  private async syncPendingData(): Promise<void> {
    console.log('🔄 Syncing pending data...');
    // This would sync any locally stored data that needs to be uploaded
    // For now, just refresh critical data
    try {
      await this.getComplaints();
      await this.getDashboardStats();
    } catch (error) {
      console.error('❌ Failed to sync data:', error);
    }
  }

  private getMockData(url: string): ApiResponse<any> {
    if (url.includes('/complaints')) {
      return { success: true, data: mockComplaints };
    } else if (url.includes('/users')) {
      return { success: true, data: mockUsers };
    } else if (url.includes('/customers')) {
      return { success: true, data: mockCustomers };
    } else if (url.includes('/dashboard')) {
      return {
        success: true,
        data: {
          totalComplaints: mockComplaints.length,
          activeComplaints: mockComplaints.filter(c => c.status === 'pending').length,
          resolvedComplaints: mockComplaints.filter(c => c.status === 'resolved').length,
          recentComplaints: mockComplaints.slice(0, 5)
        }
      };
    }
    return { success: false, error: 'Mock data not available' };
  }

  // API Methods with enhanced caching and offline support

  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    const response = await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', ...credentials })
    });

    // Cache user session if successful
    if (response.success && response.data) {
      await dataPersistence.saveData('user_session', response.data);
      await dataPersistence.saveData('auth_token', response.data.token);
    }

    return response;
  }

  async getComplaints(filters?: any): Promise<ApiResponse> {
    const cacheKey = `complaints_${JSON.stringify(filters || {})}`;
    return this.makeRequest('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(filters || {})
    }, cacheKey);
  }

  async getDashboardStats(): Promise<ApiResponse> {
    return this.makeRequest('/api/dashboard/stats', {
      method: 'GET'
    }, 'dashboard_stats');
  }

  async createComplaint(complaint: any): Promise<ApiResponse> {
    const response = await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({ action: 'createComplaint', complaintData: complaint })
    });

    // Invalidate complaints cache after creating new complaint
    if (response.success) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('complaints_')) {
          localStorage.removeItem(key);
        }
      });
    }

    return response;
  }

  async updateComplaint(id: string, updates: any): Promise<ApiResponse> {
    const response = await this.makeRequest(`/api/complaints/${id}`, {
      method: 'POST',
      body: JSON.stringify(updates)
    });

    // Invalidate cache after update
    if (response.success) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('complaints_') || key.includes('dashboard_stats')) {
          localStorage.removeItem(key);
        }
      });
    }

    return response;
  }

  // Get network and cache status
  getStatus(): any {
    return {
      network: this.networkStatus,
      cache: dataPersistence.getCacheInfo(),
      apiUrl: this.baseUrl,
      demoMode: this.demoMode
    };
  }

  // Force refresh data (bypass cache)
  async forceRefresh(): Promise<void> {
    console.log('🔄 Forcing data refresh...');
    await dataPersistence.clearAll();
    await this.checkConnection();
    await this.syncPendingData();
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();