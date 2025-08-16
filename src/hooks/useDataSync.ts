// Data synchronization hook for maintaining app state and handling network issues
import { useState, useEffect, useCallback } from 'react';
import { enhancedApiService } from '@/lib/api-enhanced';
import { dataPersistence } from '@/lib/persistence';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  isLoading: boolean;
  error: string | null;
  pendingSync: number;
}

export interface DataSyncOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  retryOnError?: boolean;
  maxRetries?: number;
}

export function useDataSync(options: DataSyncOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    retryOnError = true,
    maxRetries = 3
  } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: 0,
    isLoading: false,
    error: null,
    pendingSync: 0
  });

  const [retryCount, setRetryCount] = useState(0);

  // Sync data from server
  const syncData = useCallback(async (force = false) => {
    if (syncStatus.isLoading && !force) return;

    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔄 Syncing data...');
      
      // Get server status first
      const status = enhancedApiService.getStatus();
      
      // Sync critical data
      const [complaints, dashboard] = await Promise.allSettled([
        enhancedApiService.getComplaints(),
        enhancedApiService.getDashboardStats()
      ]);

      const now = Date.now();
      
      setSyncStatus(prev => ({
        ...prev,
        isOnline: status.network.isOnline,
        lastSync: now,
        isLoading: false,
        error: null
      }));

      setRetryCount(0);
      console.log('✅ Data sync completed');
      
    } catch (error) {
      console.error('❌ Data sync failed:', error);
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));

      // Retry logic
      if (retryOnError && retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          syncData(true);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    }
  }, [syncStatus.isLoading, retryOnError, maxRetries, retryCount]);

  // Force refresh (bypass cache)
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing data...');
    await enhancedApiService.forceRefresh();
    await syncData(true);
  }, [syncData]);

  // Get cached data immediately
  const getCachedData = useCallback(async (key: string) => {
    return await dataPersistence.getData(key);
  }, []);

  // Check if data is fresh
  const isDataFresh = useCallback((key: string) => {
    return dataPersistence.isDataFresh(key);
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network back online - syncing data');
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncData(true);
    };

    const handleOffline = () => {
      console.log('🔌 Network offline - using cached data');
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  // App visibility change (mobile lifecycle)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 App became visible - checking for updates');
        syncData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncData]);

  // Auto refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (syncStatus.isOnline && !syncStatus.isLoading) {
        console.log('⏰ Auto-refreshing data');
        syncData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, syncStatus.isOnline, syncStatus.isLoading, syncData]);

  // Initial sync
  useEffect(() => {
    syncData();
  }, []);

  return {
    syncStatus,
    syncData,
    forceRefresh,
    getCachedData,
    isDataFresh,
    retryCount
  };
}