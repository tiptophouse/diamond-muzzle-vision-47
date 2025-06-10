
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Wifi } from 'lucide-react';
import { BACKEND_CONFIG } from '@/lib/config/backend';

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      
      const response = await fetch(`${BACKEND_CONFIG.API_URL}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BACKEND_CONFIG.ACCESS_TOKEN}`,
        },
      });

      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          text: 'Checking...'
        };
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          text: 'Connected'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          text: 'Disconnected'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
      <div className={`p-2 rounded-full ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">Backend API</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={config.color}>{config.text}</span>
          {lastChecked && (
            <span className="text-gray-500">
              • Last checked {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={checkApiStatus}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}
