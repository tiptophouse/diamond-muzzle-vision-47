import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ErrorReport {
  id?: string;
  error_type: 'javascript' | 'network' | 'authentication' | 'api' | 'user_action';
  error_message: string;
  error_stack?: string;
  url?: string;
  user_agent?: string;
  timestamp?: string;
  user_id?: string;
  additional_context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemMetrics {
  errorRate: number;
  totalErrors: number;
  criticalErrors: number;
  performanceScore: number;
  uptime: number;
}

class ErrorMonitoringService {
  private errorQueue: ErrorReport[] = [];
  private isSubmitting = false;
  private retryCount = 0;
  private maxRetries = 3;

  // Capture and report errors
  public captureError(error: ErrorReport): void {
    console.error('📊 ERROR MONITOR: Capturing error:', error);
    
    // Add timestamp and enhance error data
    const enhancedError: ErrorReport = {
      ...error,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      user_agent: navigator.userAgent,
      additional_context: {
        ...error.additional_context,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        memory: (performance as any)?.memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize
        } : undefined
      }
    };

    // Queue for batch submission
    this.errorQueue.push(enhancedError);
    
    // Show user notification for critical errors
    if (error.severity === 'critical') {
      toast({
        title: "System Error",
        description: "A critical error occurred. Our team has been notified.",
        variant: "destructive"
      });
    }

    // Submit immediately for critical errors, batch for others
    if (error.severity === 'critical' || this.errorQueue.length >= 5) {
      this.submitErrors();
    } else {
      // Batch submit after delay
      setTimeout(() => this.submitErrors(), 5000);
    }
  }

  // Submit errors to analytics_events table (temporary until types are updated)
  private async submitErrors(): Promise<void> {
    if (this.isSubmitting || this.errorQueue.length === 0) return;
    
    this.isSubmitting = true;
    const errorsToSubmit = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Map to analytics_events format temporarily
      const analyticsEvents = errorsToSubmit.map(error => ({
        event_type: `error_${error.error_type}`,
        page_path: error.url || window.location.pathname,
        session_id: crypto.randomUUID(),
        event_data: {
          error_message: error.error_message,
          error_stack: error.error_stack,
          severity: error.severity,
          additional_context: error.additional_context
        },
        user_agent: error.user_agent,
        timestamp: error.timestamp
      }));

      const { error } = await supabase
        .from('analytics_events')
        .insert(analyticsEvents);

      if (error) {
        console.error('📊 ERROR MONITOR: Failed to submit errors:', error);
        // Re-queue errors for retry
        this.errorQueue.push(...errorsToSubmit);
        this.retryCount++;
        
        if (this.retryCount < this.maxRetries) {
          setTimeout(() => this.submitErrors(), Math.pow(2, this.retryCount) * 1000);
        }
      } else {
        console.log('📊 ERROR MONITOR: Successfully submitted', errorsToSubmit.length, 'errors');
        this.retryCount = 0;
      }
    } catch (submitError) {
      console.error('📊 ERROR MONITOR: Submit error:', submitError);
      this.errorQueue.push(...errorsToSubmit);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Get system health metrics from analytics_events
  public async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const { data: errorData, error } = await supabase
        .from('analytics_events')
        .select('event_type, event_data, timestamp')
        .like('event_type', 'error_%')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('📊 ERROR MONITOR: Failed to fetch metrics:', error);
        return this.getDefaultMetrics();
      }

      const totalErrors = errorData?.length || 0;
      const criticalErrors = errorData?.filter(e => 
        e.event_data && typeof e.event_data === 'object' && 
        'severity' in e.event_data && e.event_data.severity === 'critical'
      ).length || 0;
      const errorRate = totalErrors / 1440; // errors per minute in 24h
      
      // Simple performance score calculation
      const performanceScore = Math.max(0, 100 - (criticalErrors * 10) - (totalErrors * 0.5));
      
      return {
        errorRate,
        totalErrors,
        criticalErrors,
        performanceScore: Math.round(performanceScore),
        uptime: 99.9 // Placeholder - would need real uptime tracking
      };
    } catch (error) {
      console.error('📊 ERROR MONITOR: Metrics error:', error);
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): SystemMetrics {
    return {
      errorRate: 0,
      totalErrors: 0,
      criticalErrors: 0,
      performanceScore: 100,
      uptime: 99.9
    };
  }

  // Setup global error handlers
  public initialize(): void {
    console.log('📊 ERROR MONITOR: Initializing global error handlers');

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        error_type: 'javascript',
        error_message: event.message,
        error_stack: event.error?.stack,
        severity: 'high',
        additional_context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        error_type: 'javascript',
        error_message: `Unhandled Promise Rejection: ${event.reason}`,
        severity: 'medium',
        additional_context: {
          reason: event.reason,
          promise: event.promise
        }
      });
    });

    // Network errors (basic detection)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.captureError({
            error_type: 'network',
            error_message: `HTTP ${response.status}: ${response.statusText}`,
            severity: response.status >= 500 ? 'high' : 'medium',
            additional_context: {
              url: args[0],
              status: response.status,
              statusText: response.statusText
            }
          });
        }
        
        return response;
      } catch (error) {
        this.captureError({
          error_type: 'network',
          error_message: `Network error: ${error}`,
          severity: 'high',
          additional_context: {
            url: args[0],
            error: error instanceof Error ? error.message : String(error)
          }
        });
        throw error;
      }
    };
  }
}

// Create global instance
export const errorMonitor = new ErrorMonitoringService();

// Auto-initialize
if (typeof window !== 'undefined') {
  errorMonitor.initialize();
}

// Convenience functions
export const captureError = (error: Partial<ErrorReport>) => {
  errorMonitor.captureError({
    error_type: 'user_action',
    error_message: 'Unknown error',
    severity: 'medium',
    ...error
  } as ErrorReport);
};

export const captureException = (error: Error, context?: any) => {
  errorMonitor.captureError({
    error_type: 'javascript',
    error_message: error.message,
    error_stack: error.stack,
    severity: 'high',
    additional_context: context
  });
};

export const getSystemMetrics = () => errorMonitor.getSystemMetrics();