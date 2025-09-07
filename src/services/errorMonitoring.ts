/**
 * Production Error Monitoring & Alerting System
 * 
 * Centralizes error tracking, reporting, and alerting for production environment
 * Integrates with Supabase for persistent error logging and admin notifications
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/productionLogger';

export interface ErrorReport {
  id?: string;
  type: 'javascript_error' | 'network_error' | 'auth_error' | 'api_error' | 'user_action_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: {
    userId?: number;
    userAgent?: string;
    url?: string;
    component?: string;
    action?: string;
    timestamp: string;
    sessionId?: string;
    additionalData?: Record<string, any>;
  };
}

export interface UserFeedback {
  errorId: string;
  feedback: string;
  userContact?: string;
}

class ErrorMonitoringService {
  private sessionId: string;
  private userId?: number;
  private errorQueue: ErrorReport[] = [];
  private isOnline = true;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.setupNetworkListener();
    this.setupUnhandledErrorListeners();
  }

  private setupNetworkListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupUnhandledErrorListeners() {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        type: 'javascript_error',
        severity: 'high',
        message: event.message,
        stack: event.error?.stack,
        context: {
          url: event.filename,
          component: 'Global',
          action: 'unhandled_error',
          timestamp: new Date().toISOString(),
          additionalData: {
            lineno: event.lineno,
            colno: event.colno
          }
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: 'javascript_error',
        severity: 'high',
        message: `Unhandled promise rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          component: 'Global',
          action: 'unhandled_promise_rejection',
          timestamp: new Date().toISOString(),
          additionalData: {
            reason: event.reason
          }
        }
      });
    });
  }

  setUserId(userId: number) {
    this.userId = userId;
  }

  async reportError(error: Omit<ErrorReport, 'context'> & { 
    context: Partial<ErrorReport['context']> 
  }): Promise<string | null> {
    const errorReport: ErrorReport = {
      ...error,
      context: {
        userId: this.userId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        ...error.context
      }
    };

    // Log locally first
    logger.error(`[${error.type}] ${error.message}`, {
      severity: error.severity,
      context: errorReport.context,
      stack: error.stack
    }, errorReport.context.component);

    // Queue for sending to server
    this.errorQueue.push(errorReport);

    if (this.isOnline) {
      return await this.flushErrorQueue();
    }

    return null;
  }

  private async flushErrorQueue(): Promise<string | null> {
    if (this.errorQueue.length === 0) return null;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const { data, error } = await supabase.functions.invoke('report-error', {
        body: { errors }
      });

      if (error) {
        logger.error('Failed to send error reports to server', error);
        // Re-queue errors for later
        this.errorQueue.push(...errors);
        return null;
      }

      logger.info(`Successfully sent ${errors.length} error reports to server`);
      return data?.errorIds?.[0] || null;

    } catch (err) {
      logger.error('Error monitoring service failed', err);
      // Re-queue errors for later
      this.errorQueue.push(...errors);
      return null;
    }
  }

  // Network error reporting
  async reportNetworkError(
    url: string,
    method: string,
    status?: number,
    responseText?: string,
    component?: string
  ) {
    return this.reportError({
      type: 'network_error',
      severity: status && status >= 500 ? 'high' : 'medium',
      message: `Network error: ${method} ${url} (${status || 'no response'})`,
      context: {
        component,
        action: 'network_request',
        additionalData: {
          url,
          method,
          status,
          responseText: responseText?.substring(0, 500)
        }
      }
    });
  }

  // Authentication error reporting
  async reportAuthError(
    message: string,
    context?: Record<string, any>,
    component?: string
  ) {
    return this.reportError({
      type: 'auth_error',
      severity: 'high',
      message: `Authentication error: ${message}`,
      context: {
        component,
        action: 'authentication',
        additionalData: context
      }
    });
  }

  // API error reporting
  async reportApiError(
    endpoint: string,
    errorData: any,
    component?: string
  ) {
    return this.reportError({
      type: 'api_error',
      severity: 'medium',
      message: `API error: ${endpoint}`,
      context: {
        component,
        action: 'api_call',
        additionalData: {
          endpoint,
          errorData
        }
      }
    });
  }

  // User action error reporting (user-initiated errors)
  async reportUserActionError(
    action: string,
    message: string,
    component?: string,
    additionalData?: Record<string, any>
  ) {
    return this.reportError({
      type: 'user_action_error',
      severity: 'low',
      message: `User action error: ${message}`,
      context: {
        component,
        action,
        additionalData
      }
    });
  }

  // User feedback collection
  async submitUserFeedback(feedback: UserFeedback): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('submit-error-feedback', {
        body: feedback
      });

      if (error) {
        logger.error('Failed to submit user feedback', error);
        return false;
      }

      logger.info('User feedback submitted successfully');
      return true;

    } catch (err) {
      logger.error('Error submitting user feedback', err);
      return false;
    }
  }

  // Get error statistics for debugging
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      queuedErrors: this.errorQueue.length,
      isOnline: this.isOnline
    };
  }
}

// Export singleton instance
export const errorMonitoring = new ErrorMonitoringService();

// Convenience functions for common error types
export const reportError = (error: Parameters<typeof errorMonitoring.reportError>[0]) =>
  errorMonitoring.reportError(error);

export const reportNetworkError = (
  url: string,
  method: string,
  status?: number,
  responseText?: string,
  component?: string
) => errorMonitoring.reportNetworkError(url, method, status, responseText, component);

export const reportAuthError = (
  message: string,
  context?: Record<string, any>,
  component?: string
) => errorMonitoring.reportAuthError(message, context, component);

export const reportApiError = (
  endpoint: string,
  errorData: any,
  component?: string
) => errorMonitoring.reportApiError(endpoint, errorData, component);

export const reportUserActionError = (
  action: string,
  message: string,
  component?: string,
  additionalData?: Record<string, any>
) => errorMonitoring.reportUserActionError(action, message, component, additionalData);