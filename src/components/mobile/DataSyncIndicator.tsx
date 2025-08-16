// Data sync status indicator for mobile app
import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';

export function DataSyncIndicator() {
  const { syncStatus, forceRefresh } = useDataSync();

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500';
    if (syncStatus.isLoading) return 'text-blue-500';
    if (syncStatus.error) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return <WifiOff size={16} />;
    if (syncStatus.isLoading) return <RefreshCw size={16} className="animate-spin" />;
    if (syncStatus.error) return <AlertCircle size={16} />;
    return <CheckCircle2 size={16} />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isLoading) return 'Syncing...';
    if (syncStatus.error) return 'Sync Error';
    if (syncStatus.lastSync) {
      const minutes = Math.floor((Date.now() - syncStatus.lastSync) / 60000);
      return minutes > 0 ? `${minutes}m ago` : 'Just now';
    }
    return 'Ready';
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </div>
      
      {(syncStatus.error || !syncStatus.isOnline) && (
        <button
          onClick={() => forceRefresh()}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          disabled={syncStatus.isLoading}
        >
          <RefreshCw size={14} className={syncStatus.isLoading ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
}

// Connection status banner for offline mode
export function OfflineBanner() {
  const { syncStatus } = useDataSync();

  if (syncStatus.isOnline) return null;

  return (
    <div className="bg-yellow-500/20 border-yellow-500/30 border-l-4 p-3 mx-4 rounded-r-lg">
      <div className="flex items-center gap-2 text-yellow-700">
        <WifiOff size={16} />
        <div>
          <p className="font-medium text-sm">You're offline</p>
          <p className="text-xs opacity-75">Showing cached data. Changes will sync when reconnected.</p>
        </div>
      </div>
    </div>
  );
}