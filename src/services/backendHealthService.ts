
import { API_BASE_URL, getFallbackApiUrl } from '@/lib/api/config';

interface BackendStatus {
  fastApiAvailable: boolean;
  supabaseAvailable: boolean;
  recommendedMethod: 'fastapi' | 'supabase' | 'none';
  lastChecked: Date;
}

class BackendHealthService {
  private status: BackendStatus = {
    fastApiAvailable: false,
    supabaseAvailable: true, // Assume Supabase is always available
    recommendedMethod: 'supabase',
    lastChecked: new Date()
  };
  
  private checkInterval: number = 30000; // 30 seconds
  private lastCheck: number = 0;

  async checkBackendHealth(): Promise<BackendStatus> {
    const now = Date.now();
    
    // Only check if enough time has passed
    if (now - this.lastCheck < this.checkInterval) {
      return this.status;
    }
    
    this.lastCheck = now;
    console.log('🔍 Checking backend health...');
    
    try {
      // Test FastAPI availability
      const fastApiAvailable = await this.testFastApiHealth();
      
      this.status = {
        fastApiAvailable,
        supabaseAvailable: true, // Supabase is assumed to be always available
        recommendedMethod: fastApiAvailable ? 'fastapi' : 'supabase',
        lastChecked: new Date()
      };
      
      console.log('📊 Backend health status:', this.status);
      return this.status;
      
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      
      this.status = {
        fastApiAvailable: false,
        supabaseAvailable: true,
        recommendedMethod: 'supabase',
        lastChecked: new Date()
      };
      
      return this.status;
    }
  }

  private async testFastApiHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok || response.status === 404; // 404 is fine, means server is running
      
    } catch (error) {
      console.log('FastAPI health check failed:', error);
      return false;
    }
  }

  getStatus(): BackendStatus {
    return this.status;
  }

  isHealthy(): boolean {
    return this.status.fastApiAvailable || this.status.supabaseAvailable;
  }
}

export const backendHealthService = new BackendHealthService();
