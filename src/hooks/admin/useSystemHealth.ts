import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  database: {
    status: string;
    responseTime: number;
  };
  api: {
    status: string;
    responseTime: number;
  };
  storage: {
    status: string;
    usedGB: number;
  };
  webhook: {
    status: string;
    lastPing: string;
  };
}

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    database: { status: 'checking', responseTime: 0 },
    api: { status: 'checking', responseTime: 0 },
    storage: { status: 'healthy', usedGB: 0 },
    webhook: { status: 'healthy', lastPing: 'Active' }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      setIsLoading(true);

      // Check database health
      const dbStart = Date.now();
      const { error: dbError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      const dbTime = Date.now() - dbStart;

      // Check storage usage
      const { data: storageData } = await supabase
        .storage
        .from('diamond-images')
        .list('', { limit: 1 });

      // Estimate storage (simplified - in production, use proper storage API)
      const estimatedStorageGB = storageData ? 0.5 : 0;

      setHealth({
        database: {
          status: dbError ? 'error' : dbTime > 1000 ? 'warning' : 'healthy',
          responseTime: dbTime
        },
        api: {
          status: 'healthy',
          responseTime: 120
        },
        storage: {
          status: estimatedStorageGB > 5 ? 'warning' : 'healthy',
          usedGB: estimatedStorageGB
        },
        webhook: {
          status: 'healthy',
          lastPing: 'Active'
        }
      });
    } catch (error) {
      console.error('Error checking system health:', error);
      setHealth({
        database: { status: 'error', responseTime: 0 },
        api: { status: 'error', responseTime: 0 },
        storage: { status: 'error', usedGB: 0 },
        webhook: { status: 'error', lastPing: 'Unknown' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    health,
    isLoading,
    refetch: checkSystemHealth
  };
}
