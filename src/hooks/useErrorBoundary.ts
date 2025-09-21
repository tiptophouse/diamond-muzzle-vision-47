import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Best practice error boundary hook for graceful error handling
 */
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: unknown, context?: string) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Log error for debugging
    console.error(`Error in ${context || 'component'}:`, errorObj);
    
    // Set error state
    setError(errorObj);
    
    // Show user-friendly message
    const userMessage = getErrorMessage(errorObj, context);
    toast.error(userMessage);
    
    return errorObj;
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncOperation();
    } catch (error) {
      captureError(error, context);
      return fallback;
    }
  }, [captureError]);

  return {
    error,
    resetError,
    captureError,
    handleAsyncError,
    hasError: error !== null
  };
}

/**
 * Convert technical errors to user-friendly messages
 */
function getErrorMessage(error: Error, context?: string): string {
  // Network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'Network connection issue. Please check your internet connection.';
  }
  
  // API errors
  if (error.message.includes('401') || error.message.includes('unauthorized')) {
    return 'Session expired. Please refresh and try again.';
  }
  
  if (error.message.includes('403') || error.message.includes('forbidden')) {
    return 'Access denied. You may not have permission for this action.';
  }
  
  if (error.message.includes('404')) {
    return 'The requested item could not be found.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again in a few moments.';
  }
  
  // Context-specific errors
  if (context === 'sharing' && error.name === 'AbortError') {
    return 'Sharing was cancelled.';
  }
  
  if (context === 'deletion') {
    return 'Failed to delete item. Please try again.';
  }
  
  if (context === 'upload') {
    return 'Upload failed. Please check file format and try again.';
  }
  
  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}