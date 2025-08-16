// Data persistence and offline support for mobile app
export class DataPersistence {
  private static instance: DataPersistence;
  private cache: Map<string, any> = new Map();
  private lastSync: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_PREFIX = 'eeu_complaints_';

  static getInstance(): DataPersistence {
    if (!DataPersistence.instance) {
      DataPersistence.instance = new DataPersistence();
    }
    return DataPersistence.instance;
  }

  // Save data to both memory and localStorage
  async saveData(key: string, data: any): Promise<void> {
    try {
      const timestamp = Date.now();
      const cacheData = {
        data,
        timestamp,
        expires: timestamp + this.CACHE_DURATION
      };

      // Save to memory cache
      this.cache.set(key, cacheData);
      this.lastSync.set(key, timestamp);

      // Save to localStorage for persistence
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${key}`, 
        JSON.stringify(cacheData)
      );

      console.log(`💾 Data saved for key: ${key}`);
    } catch (error) {
      console.error('❌ Failed to save data:', error);
    }
  }

  // Get data from cache or localStorage
  async getData(key: string): Promise<any | null> {
    try {
      // First check memory cache
      const memoryData = this.cache.get(key);
      if (memoryData && memoryData.expires > Date.now()) {
        console.log(`🚀 Data retrieved from memory cache: ${key}`);
        return memoryData.data;
      }

      // Check localStorage
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (stored) {
        const cachedData = JSON.parse(stored);
        if (cachedData.expires > Date.now()) {
          // Update memory cache
          this.cache.set(key, cachedData);
          console.log(`💾 Data retrieved from localStorage: ${key}`);
          return cachedData.data;
        } else {
          // Data expired, remove it
          this.removeData(key);
        }
      }

      console.log(`❌ No valid cached data for key: ${key}`);
      return null;
    } catch (error) {
      console.error('❌ Failed to get data:', error);
      return null;
    }
  }

  // Check if data is fresh (not expired)
  isDataFresh(key: string): boolean {
    const lastSyncTime = this.lastSync.get(key);
    if (!lastSyncTime) return false;
    return (Date.now() - lastSyncTime) < this.CACHE_DURATION;
  }

  // Remove data from cache and localStorage
  async removeData(key: string): Promise<void> {
    this.cache.delete(key);
    this.lastSync.delete(key);
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    console.log(`🗑️ Data removed for key: ${key}`);
  }

  // Clear all cached data
  async clearAll(): Promise<void> {
    this.cache.clear();
    this.lastSync.clear();
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 All cached data cleared');
  }

  // Get cache statistics
  getCacheInfo(): any {
    const memoryKeys = Array.from(this.cache.keys());
    const storageKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.STORAGE_PREFIX)
    );

    return {
      memoryCache: memoryKeys.length,
      localStorage: storageKeys.length,
      lastSyncTimes: Object.fromEntries(this.lastSync),
      cacheKeys: memoryKeys
    };
  }
}

// Export singleton instance
export const dataPersistence = DataPersistence.getInstance();