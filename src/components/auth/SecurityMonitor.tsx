
import { useEffect, useState } from 'react';
import { getAuthenticationMetrics } from '@/utils/telegramValidation';
import { getSecurityMetrics } from '@/lib/api/auth';
import { Shield, Clock, Hash, Activity } from 'lucide-react';

interface SecurityMetrics {
  cachedHashes: number;
  maxAge: number;
  cleanupInterval: number;
  lastAuthentication: string | null;
  authenticationStatus: boolean;
  attemptTimestamp: number;
  environment: string;
  hasInitData: boolean;
  initDataLength: number;
  validationStatus: 'pending' | 'success' | 'failed';
}

export function SecurityMonitor() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = () => {
      const authMetrics = getAuthenticationMetrics();
      const apiMetrics = getSecurityMetrics();
      
      const combinedMetrics: SecurityMetrics = {
        cachedHashes: 0,
        maxAge: 300,
        cleanupInterval: 60000,
        lastAuthentication: apiMetrics.lastAuthentication,
        authenticationStatus: apiMetrics.authenticationStatus,
        attemptTimestamp: authMetrics.attemptTimestamp,
        environment: authMetrics.environment,
        hasInitData: authMetrics.hasInitData,
        initDataLength: authMetrics.initDataLength,
        validationStatus: authMetrics.validationStatus
      };
      
      setMetrics(combinedMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors"
        title="Security Monitor"
      >
        <Shield size={20} />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 text-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            Security Monitor
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <Hash size={14} />
                Cached Hashes
              </span>
              <span className="font-mono text-blue-600">{metrics.cachedHashes}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <Clock size={14} />
                Max Age
              </span>
              <span className="font-mono text-blue-600">{metrics.maxAge}s</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <Activity size={14} />
                Authentication
              </span>
              <span className={`font-mono ${metrics.authenticationStatus ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.authenticationStatus ? 'Valid' : 'Invalid'}
              </span>
            </div>
            
            {metrics.lastAuthentication && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-600 text-xs">Last Authentication:</span>
                <div className="font-mono text-xs text-gray-500 mt-1">
                  {new Date(metrics.lastAuthentication).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            🛡️ Enhanced Security Active
          </div>
        </div>
      )}
    </div>
  );
}
