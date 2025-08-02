
import React, { createContext, useContext, useCallback } from 'react';
import { FeedbackWidget } from './FeedbackWidget';
import { useFeedbackTriggers } from '@/hooks/useFeedbackTriggers';
import { useFeedbackCollection } from '@/hooks/useFeedbackCollection';

interface FeedbackContextType {
  showFeedback: (category: string, title?: string) => void;
  trackAction: (action: string, count?: number) => void;
  trackFeatureUsage: (feature: string, success: boolean, metadata?: Record<string, any>) => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { activeTrigger, closeFeedback, trackAction } = useFeedbackTriggers();
  const { trackFeatureUsage } = useFeedbackCollection();

  const showFeedback = useCallback((category: string, title?: string) => {
    // This would typically open a modal or widget
    // For now, we'll track the intent to show feedback
    trackAction('manual_feedback_request');
  }, [trackAction]);

  return (
    <FeedbackContext.Provider value={{ showFeedback, trackAction, trackFeatureUsage }}>
      {children}
      
      {/* Auto-triggered Feedback Widget */}
      {activeTrigger && (
        <FeedbackWidget
          category={activeTrigger.category}
          title="איך החוויה עד כה?"
          onClose={closeFeedback}
          compact={true}
        />
      )}
    </FeedbackContext.Provider>
  );
}
