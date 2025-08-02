
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export interface FeedbackData {
  type: 'feature_usage' | 'user_satisfaction' | 'bug_report' | 'suggestion' | 'rating' | 'interaction';
  category: string;
  rating?: number;
  message?: string;
  metadata?: Record<string, any>;
  page_url?: string;
  user_action?: string;
}

export function useFeedbackCollection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramWebApp();

  const submitFeedback = useCallback(async (feedbackData: FeedbackData) => {
    if (!user?.id) {
      console.warn('User not authenticated, feedback not submitted');
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          telegram_id: user.id,
          feedback_type: feedbackData.type,
          category: feedbackData.category,
          rating: feedbackData.rating,
          message: feedbackData.message,
          metadata: {
            ...feedbackData.metadata,
            page_url: feedbackData.page_url || window.location.pathname,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
          }
        });

      if (error) throw error;

      // Provide haptic feedback for successful submission
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }

      toast({
        title: "🙏 תודה על המשוב!",
        description: "המשוב שלך עוזר לנו לשפר את החוויה עבורך",
      });

      return true;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error');
      }

      toast({
        title: "שגיאה בשליחת משוב",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, webApp]);

  const trackInteraction = useCallback((action: string, category: string, metadata?: Record<string, any>) => {
    submitFeedback({
      type: 'interaction',
      category,
      user_action: action,
      metadata,
    });
  }, [submitFeedback]);

  const trackFeatureUsage = useCallback((feature: string, success: boolean, metadata?: Record<string, any>) => {
    submitFeedback({
      type: 'feature_usage',
      category: feature,
      rating: success ? 5 : 1,
      metadata: {
        ...metadata,
        success,
      },
    });
  }, [submitFeedback]);

  return {
    submitFeedback,
    trackInteraction,
    trackFeatureUsage,
    isSubmitting,
  };
}
