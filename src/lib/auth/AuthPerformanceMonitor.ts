interface AuthMetrics {
  authStartTime: number;
  authEndTime: number;
  authDuration: number;
  authMethod: 'cached' | 'jwt' | 'fallback';
  success: boolean;
  userId?: number;
  error?: string;
}

class AuthPerformanceMonitor {
  private static instance: AuthPerformanceMonitor;
  private metrics: AuthMetrics[] = [];
  private readonly MAX_METRICS = 100;

  private constructor() {}

  static getInstance(): AuthPerformanceMonitor {
    if (!AuthPerformanceMonitor.instance) {
      AuthPerformanceMonitor.instance = new AuthPerformanceMonitor();
    }
    return AuthPerformanceMonitor.instance;
  }

  recordAuthAttempt(metrics: AuthMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    console.log('📊 Auth Performance:', {
      duration: `${metrics.authDuration}ms`,
      method: metrics.authMethod,
      success: metrics.success,
      userId: metrics.userId
    });
  }

  getAverageAuthTime(): number {
    if (this.metrics.length === 0) return 0;
    
    const totalTime = this.metrics.reduce((sum, metric) => sum + metric.authDuration, 0);
    return Math.round(totalTime / this.metrics.length);
  }

  getSuccessRate(): number {
    if (this.metrics.length === 0) return 0;
    
    const successfulAuths = this.metrics.filter(metric => metric.success).length;
    return Math.round((successfulAuths / this.metrics.length) * 100);
  }

  getCachedAuthPercentage(): number {
    if (this.metrics.length === 0) return 0;
    
    const cachedAuths = this.metrics.filter(metric => metric.authMethod === 'cached').length;
    return Math.round((cachedAuths / this.metrics.length) * 100);
  }

  getPerformanceSummary(): string {
    return `Auth Performance: ${this.getAverageAuthTime()}ms avg, ${this.getSuccessRate()}% success, ${this.getCachedAuthPercentage()}% cached`;
  }

  clearMetrics(): void {
    this.metrics = [];
    console.log('📊 Auth performance metrics cleared');
  }
}

export default AuthPerformanceMonitor;
