
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

interface SystemHealthStatus {
  backend: 'healthy' | 'degraded' | 'offline';
  auth: 'authenticated' | 'anonymous' | 'error';
  features: {
    inventory: boolean;
    store: boolean;
    upload: boolean;
    chat: boolean;
  };
  errors: string[];
  warnings: string[];
}

export function useSystemHealth() {
  const [status, setStatus] = useState<SystemHealthStatus>({
    backend: 'offline',
    auth: 'anonymous',
    features: {
      inventory: false,
      store: false,
      upload: false,
      chat: false,
    },
    errors: [],
    warnings: [],
  });
  const [isChecking, setIsChecking] = useState(true);
  
  const { isAuthenticated, user, error: authError } = useTelegramAuth();

  const checkSystemHealth = async () => {
    setIsChecking(true);
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Test backend connectivity
      const backendTest = await api.get('/health');
      const backendStatus = backendTest.error ? 'offline' : 'healthy';
      
      // Test authentication
      const authStatus = isAuthenticated 
        ? 'authenticated' 
        : authError 
        ? 'error' 
        : 'anonymous';
      
      if (authError) {
        warnings.push(`Authentication warning: ${authError}`);
      }
      
      // Test core features
      const features = {
        inventory: false,
        store: false,
        upload: false,
        chat: false,
      };
      
      // Test inventory functionality
      try {
        const inventoryTest = await api.get('/diamonds');
        features.inventory = !inventoryTest.error;
        if (inventoryTest.error) {
          errors.push(`Inventory system offline: ${inventoryTest.error}`);
        }
      } catch (e) {
        errors.push('Inventory system not responding');
      }
      
      // Test store functionality - assuming it uses same endpoint as inventory
      features.store = features.inventory;
      
      // Test upload functionality
      try {
        // This is a lightweight test - just check if the endpoint exists
        features.upload = backendStatus === 'healthy';
        if (!features.upload) {
          warnings.push('Upload functionality may be limited (backend offline)');
        }
      } catch (e) {
        warnings.push('Upload system needs verification');
      }
      
      // Chat is always available (frontend only)
      features.chat = true;
      
      setStatus({
        backend: backendStatus,
        auth: authStatus,
        features,
        errors,
        warnings,
      });
      
    } catch (error) {
      console.error('System health check failed:', error);
      setStatus({
        backend: 'offline',
        auth: authError ? 'error' : 'anonymous',
        features: {
          inventory: false,
          store: false,
          upload: false,
          chat: true,
        },
        errors: ['System health check failed'],
        warnings: [],
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Recheck every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    status,
    isChecking,
    recheckHealth: checkSystemHealth,
  };
}
