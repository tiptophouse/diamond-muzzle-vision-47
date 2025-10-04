
import { useState, useEffect } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { logger } from '@/utils/logger';

export function useFastApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      logger.debug('Checking FastAPI backend health');
      
      const response = await api.get(apiEndpoints.alive());
      
      if (response.data === true && !response.error) {
        logger.info('FastAPI backend is healthy');
        setIsHealthy(true);
        
        toast({
          title: "✅ Backend Connected",
          description: "FastAPI backend is online and ready",
        });
      } else {
        logger.warn('FastAPI backend returned unhealthy response');
        setIsHealthy(false);
      }
    } catch (error) {
      logger.error('FastAPI backend health check failed', error as Error);
      setIsHealthy(false);
      
      toast({
        title: "⚠️ Backend Offline",
        description: "Cannot connect to FastAPI backend. Using local storage fallback.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    isHealthy,
    isChecking,
    checkHealth,
  };
}
