import { telegramSDK } from './TelegramMiniAppSDK';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface PerformanceReport {
  appLoad: number;
  authTime: number;
  inventoryLoad: number;
  imageLoad: number;
  navigationTime: number;
  memoryUsage?: number;
  cacheHitRate: number;
  apiLatency: number[];
}

class TelegramPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();
  private readonly MAX_METRICS = 100;
  private readonly REPORT_INTERVAL = 60000; // 1 minute
  
  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Monitor app start time
    if (typeof window !== 'undefined') {
      this.recordMetric('app_start', performance.now());
      
      // Monitor navigation performance
      window.addEventListener('beforeunload', () => {
        this.flushMetrics();
      });
      
      // Periodic performance reports (debounced while hidden)
      const tick = () => {
        if (document.visibilityState !== 'hidden') {
          this.generatePerformanceReport();
        }
      };
      setInterval(tick, this.REPORT_INTERVAL);
    }
  }

  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  endTimer(operation: string, context?: Record<string, any>): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.recordMetric(operation, duration, context);
    this.startTimes.delete(operation);
    
    return duration;
  }

  recordMetric(name: string, value: number, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
    
    // Log critical performance issues
    if (this.isCriticalMetric(name, value)) {
      console.warn(`🚨 PERF: Critical performance detected - ${name}: ${value}ms`);
    }
  }

  private isCriticalMetric(name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      'auth_complete': 5000, // 5 seconds
      'inventory_load': 10000, // 10 seconds
      'image_load': 3000, // 3 seconds
      'navigation': 1000, // 1 second
      'api_call': 5000 // 5 seconds
    };
    
    return value > (thresholds[name] || 2000);
  }

  getMetrics(metricName?: string): PerformanceMetric[] {
    if (metricName) {
      return this.metrics.filter(m => m.name === metricName);
    }
    return [...this.metrics];
  }

  getAverageMetric(metricName: string): number {
    const metrics = this.getMetrics(metricName);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  generatePerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      appLoad: this.getAverageMetric('app_start'),
      authTime: this.getAverageMetric('auth_complete'),
      inventoryLoad: this.getAverageMetric('inventory_load'),
      imageLoad: this.getAverageMetric('image_load'),
      navigationTime: this.getAverageMetric('navigation'),
      cacheHitRate: this.calculateCacheHitRate(),
      apiLatency: this.getMetrics('api_call').map(m => m.value).slice(-10)
    };

    // Add memory usage if available
    if ('memory' in performance) {
      report.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    console.log('📊 PERF REPORT:', report);
    
    // Store in Telegram cloud storage for analysis
    this.storePerformanceData(report);
    
    return report;
  }

  private calculateCacheHitRate(): number {
    const cacheHits = this.getMetrics('cache_hit').length;
    const cacheMisses = this.getMetrics('cache_miss').length;
    const total = cacheHits + cacheMisses;
    
    return total > 0 ? (cacheHits / total) * 100 : 0;
  }

  private async storePerformanceData(report: PerformanceReport): Promise<void> {
    try {
      if (!telegramSDK.isInitialized()) return;
      
      // Check if CloudStorage is supported (graceful fallback)
      const webApp = telegramSDK.getWebApp();
      if (!webApp || !webApp.CloudStorage) {
        // Fallback to localStorage for development/older versions
        try {
          const perfKey = `perf_${Date.now()}`;
          const data = JSON.stringify({
            report,
            timestamp: Date.now(),
            userId: telegramSDK.getUser()?.id || 'unknown'
          });
          localStorage.setItem(perfKey, data);
          
          // Cleanup old localStorage performance data
          const keys = Object.keys(localStorage).filter(key => key.startsWith('perf_'));
          if (keys.length > 10) {
            keys.sort().slice(0, keys.length - 10).forEach(key => {
              localStorage.removeItem(key);
            });
          }
        } catch (localError) {
          console.warn('⚠️ PERF: LocalStorage fallback failed:', localError);
        }
        return;
      }
      
      const perfKey = `perf_${Date.now()}`;
      await telegramSDK.cloudStorage.setItem(perfKey, JSON.stringify({
        report,
        timestamp: Date.now(),
        userId: telegramSDK.getUser()?.id || 'unknown'
      }));
      
      // Cleanup old performance data
      await this.cleanupOldPerformanceData();
    } catch (error) {
      console.warn('⚠️ PERF: Failed to store performance data:', error);
    }
  }

  private async cleanupOldPerformanceData(): Promise<void> {
    try {
      const webApp = telegramSDK.getWebApp();
      if (!webApp || !webApp.CloudStorage) {
        return; // Skip cleanup if CloudStorage not available
      }
      
      const keys = await telegramSDK.cloudStorage.getKeys();
      const perfKeys = keys.filter(key => key.startsWith('perf_'));
      
      if (perfKeys.length > 10) {
        // Remove oldest performance entries
        const sortedKeys = perfKeys.sort();
        const keysToRemove = sortedKeys.slice(0, sortedKeys.length - 10);
        
        await Promise.allSettled(
          keysToRemove.map(key => telegramSDK.cloudStorage.removeItem(key))
        );
      }
    } catch (error) {
      console.warn('⚠️ PERF: Failed to cleanup old performance data:', error);
    }
  }

  // Telegram-specific optimizations
  optimizeForTelegram(): void {
    if (!telegramSDK.isInitialized()) return;
    
    // Enable performance monitoring
    try {
      // Set optimal viewport for performance
      const webApp = telegramSDK.getWebApp();
      if (webApp) {
        webApp.expand?.();
        
        // Monitor theme changes for performance impact
        telegramSDK.on('themeChanged', () => {
          this.recordMetric('theme_change', performance.now());
        });
        
        // Monitor viewport changes
        telegramSDK.on('viewportChanged', () => {
          this.recordMetric('viewport_change', performance.now());
        });
      }
    } catch (error) {
      console.warn('⚠️ PERF: Failed to setup Telegram optimizations:', error);
    }
  }

  // Resource cleanup
  flushMetrics(): void {
    if (this.metrics.length > 0) {
      console.log('📊 PERF: Flushing metrics before unload:', this.metrics.length);
      const report = this.generatePerformanceReport();
      
      // Store final performance report (gracefully handle CloudStorage)
      if (telegramSDK.isInitialized()) {
        const webApp = telegramSDK.getWebApp();
        if (webApp && webApp.CloudStorage) {
          telegramSDK.cloudStorage.setItem('final_perf_report', JSON.stringify({
            report,
            timestamp: Date.now(),
            sessionMetrics: this.metrics
          })).catch(error => {
            console.warn('⚠️ PERF: Failed to store final report:', error);
          });
        }
      }
    }
  }

  // Get real-time performance status
  getPerformanceStatus(): {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    recommendations: string[];
  } {
    const avgAuth = this.getAverageMetric('auth_complete');
    const avgLoad = this.getAverageMetric('inventory_load');
    const cacheRate = this.calculateCacheHitRate();
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (avgAuth > 3000) {
      issues.push('Slow authentication');
      recommendations.push('Check network connectivity');
    }
    
    if (avgLoad > 8000) {
      issues.push('Slow inventory loading');
      recommendations.push('Enable caching optimization');
    }
    
    if (cacheRate < 70) {
      issues.push('Low cache hit rate');
      recommendations.push('Improve caching strategy');
    }

    let status: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (issues.length > 2) status = 'poor';
    else if (issues.length > 1) status = 'fair';
    else if (issues.length > 0) status = 'good';
    
    return { status, issues, recommendations };
  }
}

export const telegramPerformanceMonitor = new TelegramPerformanceMonitor();
export default telegramPerformanceMonitor;
