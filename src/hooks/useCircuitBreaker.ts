
import { useState, useCallback, useRef } from 'react';

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
}

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: number;
  nextAttempt?: number;
}

export function useCircuitBreaker(options: CircuitBreakerOptions = {}) {
  const {
    failureThreshold = 3,
    resetTimeout = 10000, // 10 seconds
    monitoringPeriod = 60000 // 1 minute
  } = options;

  const [state, setState] = useState<CircuitBreakerState>({
    state: 'CLOSED',
    failureCount: 0
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const executeWithCircuitBreaker = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    const now = Date.now();
    const currentState = stateRef.current;

    // Check if circuit should be reset
    if (currentState.state === 'OPEN' && currentState.nextAttempt && now >= currentState.nextAttempt) {
      setState(prev => ({ ...prev, state: 'HALF_OPEN' }));
    }

    // Reject if circuit is open
    if (currentState.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN - operation blocked');
    }

    try {
      const result = await operation();
      
      // Success - reset failure count
      if (currentState.state === 'HALF_OPEN' || currentState.failureCount > 0) {
        setState({
          state: 'CLOSED',
          failureCount: 0,
          lastFailureTime: undefined,
          nextAttempt: undefined
        });
      }
      
      return result;
    } catch (error) {
      const newFailureCount = currentState.failureCount + 1;
      const newState: CircuitBreakerState = {
        state: newFailureCount >= failureThreshold ? 'OPEN' : 'CLOSED',
        failureCount: newFailureCount,
        lastFailureTime: now,
        nextAttempt: newFailureCount >= failureThreshold ? now + resetTimeout : undefined
      };

      setState(newState);
      throw error;
    }
  }, [failureThreshold, resetTimeout]);

  const reset = useCallback(() => {
    setState({
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: undefined,
      nextAttempt: undefined
    });
  }, []);

  const getStatus = useCallback(() => ({
    state: state.state,
    failureCount: state.failureCount,
    isOpen: state.state === 'OPEN',
    nextAttemptIn: state.nextAttempt ? Math.max(0, state.nextAttempt - Date.now()) : 0
  }), [state]);

  return {
    execute: executeWithCircuitBreaker,
    reset,
    getStatus
  };
}
