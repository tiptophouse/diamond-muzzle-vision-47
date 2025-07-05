import { useState, useEffect, useCallback } from 'react';
import { apiEndpoints, API_BASE_URL } from '@/lib/api';
import { telegramAuthService } from '@/lib/api/telegramAuth';
import { toast } from '@/components/ui/use-toast';

interface EndpointStatus {
  endpoint: string;
  status: 'success' | 'error' | 'testing' | 'not-tested';
  responseTime?: number;
  error?: string;
}

interface HealthCheckResult {
  isHealthy: boolean;
  endpoints: EndpointStatus[];
  lastChecked: Date | null;
  overallResponseTime: number;
}

export function useApiHealthCheck() {
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult>({
    isHealthy: false,
    endpoints: [],
    lastChecked: null,
    overallResponseTime: 0,
  });
  const [isChecking, setIsChecking] = useState(false);

  const testEndpoint = useCallback(async (name: string, url: string): Promise<EndpointStatus> => {
    const startTime = performance.now();
    
    try {
      console.log(`🔍 Testing endpoint: ${name} -> ${url}`);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: telegramAuthService.getAuthHeaders(),
        mode: 'cors',
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      return {
        endpoint: name,
        status: response.ok ? 'success' : 'error',
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      return {
        endpoint: name,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  const runHealthCheck = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    console.log('🏥 Starting API health check...');
    
    // Test key endpoints
    const endpointsToTest = [
      { name: 'Root', url: '/' },
      { name: 'Get All Stones', url: apiEndpoints.getAllStones(2138564172) },
      { name: 'Get Store Stones', url: apiEndpoints.getStoreStones() },
      { name: 'Get Dashboard', url: apiEndpoints.getDashboard(2138564172) },
      { name: 'Get Insights', url: apiEndpoints.getInsights(2138564172) },
    ];

    const results: EndpointStatus[] = [];
    let totalResponseTime = 0;
    let successCount = 0;

    // Update status to show testing
    setHealthCheck(prev => ({
      ...prev,
      endpoints: endpointsToTest.map(e => ({
        endpoint: e.name,
        status: 'testing' as const,
      })),
    }));

    // Test each endpoint
    for (const endpoint of endpointsToTest) {
      const result = await testEndpoint(endpoint.name, endpoint.url);
      results.push(result);
      
      if (result.status === 'success') {
        successCount++;
        totalResponseTime += result.responseTime || 0;
      }

      // Update progress
      setHealthCheck(prev => ({
        ...prev,
        endpoints: [...prev.endpoints.slice(0, results.length - 1), result, ...prev.endpoints.slice(results.length)],
      }));
    }

    const isHealthy = successCount > 0;
    const avgResponseTime = successCount > 0 ? Math.round(totalResponseTime / successCount) : 0;

    const finalResult: HealthCheckResult = {
      isHealthy,
      endpoints: results,
      lastChecked: new Date(),
      overallResponseTime: avgResponseTime,
    };

    setHealthCheck(finalResult);
    setIsChecking(false);

    // Show result toast
    if (isHealthy) {
      toast({
        title: "🟢 API Health Check Complete",
        description: `${successCount}/${results.length} endpoints responding (avg: ${avgResponseTime}ms)`,
      });
    } else {
      toast({
        title: "🔴 API Health Check Failed",
        description: "FastAPI backend is not responding",
        variant: "destructive",
      });
    }

    console.log('🏥 Health check completed:', finalResult);
    return finalResult;
  }, [isChecking, testEndpoint]);

  // Auto health check on mount
  useEffect(() => {
    runHealthCheck();
  }, []);

  return {
    healthCheck,
    isChecking,
    runHealthCheck,
  };
}