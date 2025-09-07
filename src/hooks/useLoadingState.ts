/**
 * Centralized Loading State Management
 * 
 * Provides a unified way to manage loading states across the application
 * Prevents multiple loading indicators and improves UX consistency
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/productionLogger';

export interface LoadingOperation {
  id: string;
  operation: string;
  component?: string;
  startTime: number;
  timeout?: number;
}

class LoadingStateManager {
  private operations = new Map<string, LoadingOperation>();
  private listeners = new Set<() => void>();
  
  addOperation(
    id: string,
    operation: string,
    component?: string,
    timeout = 30000
  ): () => void {
    const op: LoadingOperation = {
      id,
      operation,
      component,
      startTime: Date.now(),
      timeout
    };

    this.operations.set(id, op);
    this.notifyListeners();

    logger.debug(`Loading started: ${operation}`, { id, component });

    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (this.operations.has(id)) {
        logger.warn(`Loading operation timed out: ${operation}`, { id, component, timeout });
        this.removeOperation(id);
      }
    }, timeout);

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      this.removeOperation(id);
    };
  }

  removeOperation(id: string) {
    const op = this.operations.get(id);
    if (op) {
      const duration = Date.now() - op.startTime;
      logger.debug(`Loading completed: ${op.operation}`, { 
        id, 
        component: op.component, 
        duration 
      });
      
      this.operations.delete(id);
      this.notifyListeners();
    }
  }

  isLoading(id?: string): boolean {
    if (id) {
      return this.operations.has(id);
    }
    return this.operations.size > 0;
  }

  getLoadingOperations(): LoadingOperation[] {
    return Array.from(this.operations.values());
  }

  getLoadingByComponent(component: string): LoadingOperation[] {
    return Array.from(this.operations.values())
      .filter(op => op.component === component);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Clear all operations (useful for cleanup)
  clearAll() {
    const count = this.operations.size;
    this.operations.clear();
    if (count > 0) {
      logger.debug(`Cleared ${count} loading operations`);
      this.notifyListeners();
    }
  }

  // Get stats for debugging
  getStats() {
    return {
      totalOperations: this.operations.size,
      operations: Array.from(this.operations.values()),
      listeners: this.listeners.size
    };
  }
}

// Global loading state manager
const loadingManager = new LoadingStateManager();

/**
 * Hook for managing loading states in components
 */
export function useLoadingState(componentName?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [operations, setOperations] = useState<LoadingOperation[]>([]);
  const operationRefs = useRef(new Map<string, () => void>());

  // Subscribe to loading manager updates
  useEffect(() => {
    const updateState = () => {
      const allOps = loadingManager.getLoadingOperations();
      const componentOps = componentName 
        ? loadingManager.getLoadingByComponent(componentName)
        : allOps;
      
      setIsLoading(componentOps.length > 0);
      setOperations(componentOps);
    };

    updateState();
    const unsubscribe = loadingManager.subscribe(updateState);

    return () => {
      unsubscribe();
      // Cleanup any operations when component unmounts
      operationRefs.current.forEach(cleanup => cleanup());
      operationRefs.current.clear();
    };
  }, [componentName]);

  const startLoading = useCallback((
    operationId: string,
    operationName: string,
    timeout?: number
  ) => {
    // Clean up existing operation with same ID
    const existingCleanup = operationRefs.current.get(operationId);
    if (existingCleanup) {
      existingCleanup();
    }

    // Start new operation
    const cleanup = loadingManager.addOperation(
      operationId,
      operationName,
      componentName,
      timeout
    );

    operationRefs.current.set(operationId, cleanup);

    return cleanup;
  }, [componentName]);

  const stopLoading = useCallback((operationId: string) => {
    const cleanup = operationRefs.current.get(operationId);
    if (cleanup) {
      cleanup();
      operationRefs.current.delete(operationId);
    }
  }, []);

  const stopAllLoading = useCallback(() => {
    operationRefs.current.forEach(cleanup => cleanup());
    operationRefs.current.clear();
  }, []);

  // Async wrapper for operations
  const withLoading = useCallback(async <T>(
    operationId: string,
    operationName: string,
    operation: () => Promise<T>,
    timeout?: number
  ): Promise<T> => {
    const cleanup = startLoading(operationId, operationName, timeout);
    
    try {
      const result = await operation();
      return result;
    } finally {
      cleanup();
    }
  }, [startLoading]);

  return {
    // State
    isLoading,
    operations,
    hasOperation: (id: string) => loadingManager.isLoading(id),
    
    // Controls
    startLoading,
    stopLoading,
    stopAllLoading,
    withLoading,
    
    // Global state (useful for debugging)
    globalStats: loadingManager.getStats()
  };
}

/**
 * Hook for global loading state (any loading operation)
 */
export function useGlobalLoadingState() {
  const [isGloballyLoading, setIsGloballyLoading] = useState(false);
  const [allOperations, setAllOperations] = useState<LoadingOperation[]>([]);

  useEffect(() => {
    const updateState = () => {
      const ops = loadingManager.getLoadingOperations();
      setIsGloballyLoading(ops.length > 0);
      setAllOperations(ops);
    };

    updateState();
    return loadingManager.subscribe(updateState);
  }, []);

  return {
    isGloballyLoading,
    allOperations,
    operationCount: allOperations.length
  };
}

// Export manager for advanced usage
export { loadingManager };