
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api/config';
import { useToast } from '@/hooks/use-toast';

interface HealthCheckResult {
  isHealthy: boolean | null;
  isChecking: boolean;
  lastChecked: Date | null;
  errorMessage?: string;
}

export function useBackendHealth() {
  const [health, setHealth] = useState<HealthCheckResult>({
    isHealthy: null,
    isChecking: false,
    lastChecked: null,
  });
  const { toast } = useToast();

  const checkHealth = async (showToast: boolean = false) => {
    setHealth(prev => ({ ...prev, isChecking: true, errorMessage: undefined }));
    
    try {
      console.log('🏥 Checking backend health:', API_BASE_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const isHealthy = response.ok || response.status === 404;
      
      setHealth({
        isHealthy,
        isChecking: false,
        lastChecked: new Date(),
        errorMessage: isHealthy ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      });
      
      if (showToast) {
        toast({
          title: isHealthy ? "✅ השרת מחובר" : "❌ השרת אינו זמין",
          description: isHealthy 
            ? "החיבור לשרת FastAPI תקין" 
            : "לא ניתן להתחבר לשרת. נסה שוב מאוחר יותר.",
          variant: isHealthy ? "default" : "destructive",
        });
      }
      
      console.log('🏥 Health check result:', isHealthy);
      return isHealthy;
      
    } catch (error: any) {
      const errorMessage = error.name === 'AbortError' 
        ? 'בדיקת החיבור נכשלה עקב זמן קצוב'
        : error.message || 'שגיאה לא ידועה';
      
      setHealth({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
        errorMessage,
      });
      
      if (showToast) {
        toast({
          title: "❌ שגיאה בבדיקת החיבור",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      console.error('🏥 Health check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // Initial health check on mount
    checkHealth();
  }, []);

  return {
    ...health,
    checkHealth,
  };
}
