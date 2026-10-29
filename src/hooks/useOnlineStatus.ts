import { useState, useEffect, useCallback } from 'react';
import { syncPendingSessions, syncExercises, syncRoutines, isSyncEnabled } from '@/db/sync';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const performSync = useCallback(async () => {
    if (!isSyncEnabled || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await Promise.all([
        syncPendingSessions(),
        syncExercises(),
        syncRoutines(),
      ]);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('[Sync] Failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync on mount if online
    if (navigator.onLine && isSyncEnabled) {
      performSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performSync]);

  return { isOnline, isSyncing, lastSyncTime, isSyncEnabled, performSync };
}
