// Production-ready logging utility
interface LogContext {
  userId?: string | number;
  action?: string;
  component?: string;
  data?: any;
  url?: string;
  isHealthy?: boolean;
  firstName?: string;
  lastName?: string;
  error?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context ? context : '');
    }
    // In production, send to logging service
    this.sendToLoggingService('info', message, context);
  }
  
  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context ? context : '');
    }
    this.sendToLoggingService('warn', message, context);
  }
  
  error(message: string, error?: Error, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context ? context : '');
    }
    this.sendToLoggingService('error', message, { ...context, error: error?.message, stack: error?.stack });
  }
  
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context ? context : '');
    }
  }
  
  private sendToLoggingService(level: string, message: string, context?: any) {
    // In production, integrate with logging service like Sentry, LogRocket, etc.
    // For now, only store critical errors
    if (level === 'error') {
      try {
        // Could send to Supabase error_reports table or external service
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        }).catch(() => {}); // Silent fail for logging
      } catch {
        // Silent fail
      }
    }
  }
}

export const logger = new Logger();