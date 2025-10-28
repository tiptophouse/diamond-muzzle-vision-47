// Telegram Mini App Optimized Logging System
import { getTelegramWebApp } from './telegramWebApp';

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
  telegramUser?: any;
  [key: string]: any; // Allow flexible properties
}

interface TelegramLogData {
  level: string;
  message: string;
  context?: any;
  timestamp: string;
  userAgent?: string;
  url?: string;
  telegramUserId?: number;
}

class TelegramOptimizedLogger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;
  private logQueue: TelegramLogData[] = [];
  private maxQueueSize = 50;
  private flushInterval = 30000; // 30 seconds
  
  constructor() {
    // In production, completely disable console logging for performance
    if (this.isProduction) {
      this.disableConsoleInProduction();
    }
    
    // Set up periodic log flushing for Telegram
    if (typeof window !== 'undefined') {
      setInterval(() => this.flushCriticalLogs(), this.flushInterval);
    }
  }
  
  private disableConsoleInProduction() {
    // Override console methods in production for performance
    const noop = () => {};
    if (typeof window !== 'undefined') {
      window.console.log = noop;
      window.console.debug = noop;
      window.console.info = noop;
      // Keep console.error and console.warn for critical issues
    }
  }
  
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`🔵 [INFO] ${message}`, context || '');
    }
    this.queueLog('info', message, context);
  }
  
  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`🟡 [WARN] ${message}`, context || '');
    }
    this.queueLog('warn', message, context);
    
    // Send warnings to Telegram bot immediately in production
    if (this.isProduction) {
      this.sendToTelegramBot('warn', message, context);
    }
  }
  
  error(message: string, error?: Error, context?: LogContext) {
    // Always show errors, even in production (for debugging)
    console.error(`🔴 [ERROR] ${message}`, error, context || '');
    
    const errorContext = { 
      ...context, 
      error: error?.message, 
      stack: error?.stack 
    };
    
    this.queueLog('error', message, errorContext);
    
    // Send critical errors to Telegram bot immediately
    this.sendToTelegramBot('error', message, errorContext);
  }
  
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`🔍 [DEBUG] ${message}`, context || '');
    }
    // Don't queue debug messages for performance
  }
  
  // Telegram-specific logging for user actions
  telegramAction(action: string, context?: LogContext) {
    const tg = getTelegramWebApp();
    const telegramContext = {
      ...context,
      telegramUser: tg?.initDataUnsafe?.user
    };
    
    this.info(`Telegram Action: ${action}`, telegramContext);
  }
  
  private queueLog(level: string, message: string, context?: any) {
    if (this.logQueue.length >= this.maxQueueSize) {
      this.logQueue.shift(); // Remove oldest log
    }
    
    const tg = getTelegramWebApp();
    
    this.logQueue.push({
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      telegramUserId: tg?.initDataUnsafe?.user?.id
    });
  }
  
  private async sendToTelegramBot(level: string, message: string, context?: any) {
    try {
      const tg = getTelegramWebApp();
      
      if (tg && 'sendData' in tg && typeof tg.sendData === 'function') {
        // Send critical logs directly to the Telegram bot
        const logData = {
          type: 'app_log',
          level,
          message,
          context: JSON.stringify(context),
          timestamp: new Date().toISOString(),
          userId: tg.initDataUnsafe?.user?.id
        };
        
        tg.sendData(JSON.stringify(logData));
      }
    } catch (error) {
      // Silent fail - don't log errors in the logger itself
    }
  }
  
  private flushCriticalLogs() {
    const criticalLogs = this.logQueue.filter(log => 
      log.level === 'error' || log.level === 'warn'
    );
    
    if (criticalLogs.length > 0) {
      // Send batch of critical logs
      this.sendBatchToTelegramBot(criticalLogs);
    }
    
    // Clear the queue
    this.logQueue = [];
  }
  
  private async sendBatchToTelegramBot(logs: TelegramLogData[]) {
    try {
      const tg = getTelegramWebApp();
      
      if (tg && 'sendData' in tg && typeof tg.sendData === 'function') {
        const batchData = {
          type: 'app_logs_batch',
          logs: logs.slice(0, 10), // Limit batch size
          timestamp: new Date().toISOString()
        };
        
        tg.sendData(JSON.stringify(batchData));
      }
    } catch (error) {
      // Silent fail
    }
  }
  
  // Get current log stats for debugging
  getStats() {
    return {
      queueSize: this.logQueue.length,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      recentErrors: this.logQueue.filter(log => log.level === 'error').length
    };
  }
}

export const logger = new TelegramOptimizedLogger();