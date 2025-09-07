/**
 * Production Logger
 * 
 * Centralized logging system that respects production/development environments
 * Replaces scattered console.log statements with controlled logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class ProductionLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  private addLog(level: LogLevel, message: string, data?: any, component?: string) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component
    };

    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In development, still log to console for debugging
    if (this.isDevelopment) {
      const prefix = component ? `[${component}]` : '';
      const logFn = console[level] || console.log;
      
      if (data) {
        logFn(`${prefix} ${message}`, data);
      } else {
        logFn(`${prefix} ${message}`);
      }
    }

    // In production, only log errors and warnings to console
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      const logFn = console[level] || console.log;
      logFn(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  debug(message: string, data?: any, component?: string) {
    this.addLog('debug', message, data, component);
  }

  info(message: string, data?: any, component?: string) {
    this.addLog('info', message, data, component);
  }

  warn(message: string, data?: any, component?: string) {
    this.addLog('warn', message, data, component);
  }

  error(message: string, data?: any, component?: string) {
    this.addLog('error', message, data, component);
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by component
  getComponentLogs(component: string, count = 20): LogEntry[] {
    return this.logs
      .filter(log => log.component === component)
      .slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Convenience functions
export const logDebug = (message: string, data?: any, component?: string) => 
  logger.debug(message, data, component);

export const logInfo = (message: string, data?: any, component?: string) => 
  logger.info(message, data, component);

export const logWarn = (message: string, data?: any, component?: string) => 
  logger.warn(message, data, component);

export const logError = (message: string, data?: any, component?: string) => 
  logger.error(message, data, component);
