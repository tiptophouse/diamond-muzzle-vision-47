
import React, { createContext, useContext, ReactNode } from 'react';
import { useUserTracking } from '@/hooks/useUserTracking';

interface TrackingContextType {
  trackPageVisit: (path: string, title?: string) => void;
  trackCost: (costType: string, serviceName: string, amount: number, details?: any) => void;
  isTracking: boolean;
  sessionData: any;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const tracking = useUserTracking();

  return (
    <TrackingContext.Provider value={tracking}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}
