import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export interface AIPattern {
  pattern_type: 'successful_match' | 'pricing_pattern' | 'buyer_preference' | 'seller_pattern' | 'quick_close' | 'negotiation_success';
  pattern_data: Record<string, any>;
  success_score: number;
}

export interface AIRecommendation {
  pattern_type: string;
  recommendation: Record<string, any>;
  confidence: number;
}

export function useAILearning() {
  const { user } = useTelegramAuth();
  const [isLearning, setIsLearning] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  // Track successful interaction for AI to learn from
  const trackSuccess = useCallback(async (pattern: AIPattern) => {
    if (!user?.id) {
      logger.warn('Cannot track AI learning: user not authenticated');
      return;
    }

    setIsLearning(true);
    try {
      const { data, error } = await supabase.rpc('update_ai_learning_pattern', {
        p_user_telegram_id: user.id,
        p_pattern_type: pattern.pattern_type,
        p_pattern_data: pattern.pattern_data,
        p_success_score: pattern.success_score
      });

      if (error) throw error;

      logger.info('AI learned new pattern', {
        action: 'pattern_learned',
        type: pattern.pattern_type,
        patternId: data
      });
    } catch (error) {
      logger.error('Failed to track AI learning:', error);
    } finally {
      setIsLearning(false);
    }
  }, [user?.id]);

  // Track transaction feedback
  const trackTransaction = useCallback(async (
    feedbackType: 'deal_closed' | 'negotiation_success' | 'quick_response' | 'repeat_buyer',
    outcomeData: Record<string, any>,
    matchId?: string,
    transactionId?: string
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('ai_transaction_feedback')
        .insert({
          user_telegram_id: user.id,
          feedback_type: feedbackType,
          outcome_data: outcomeData,
          match_id: matchId,
          transaction_id: transactionId,
          learning_extracted: false
        });

      if (error) throw error;

      logger.info('Transaction feedback recorded', { action: 'feedback_recorded', feedbackType });
    } catch (error) {
      logger.error('Failed to track transaction:', error);
    }
  }, [user?.id]);

  // Get AI recommendations based on learned patterns
  const getRecommendations = useCallback(async (contextType: string = 'general') => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase.rpc('get_ai_recommendations', {
        p_user_telegram_id: user.id,
        p_context_type: contextType
      });

      if (error) throw error;

      const recs = data as AIRecommendation[] || [];
      setRecommendations(recs);
      
      if (recs.length > 0) {
        logger.info(`AI found ${recs.length} recommendations`, {
          action: 'recommendations_loaded',
          avgConfidence: (recs.reduce((sum, r) => sum + r.confidence, 0) / recs.length).toFixed(2)
        });
      }

      return recs;
    } catch (error) {
      logger.error('Failed to get AI recommendations:', error);
      return [];
    }
  }, [user?.id]);

  // Track successful diamond match
  const trackMatchSuccess = useCallback(async (matchData: {
    diamond_specs: Record<string, any>;
    buyer_criteria: Record<string, any>;
    match_score: number;
    time_to_response?: number;
  }) => {
    await trackSuccess({
      pattern_type: 'successful_match',
      pattern_data: matchData,
      success_score: matchData.match_score
    });
  }, [trackSuccess]);

  // Track pricing pattern
  const trackPricingPattern = useCallback(async (pricingData: {
    shape: string;
    weight_range: string;
    color: string;
    clarity: string;
    price_per_carat: number;
    sold_quickly: boolean;
  }) => {
    await trackSuccess({
      pattern_type: 'pricing_pattern',
      pattern_data: pricingData,
      success_score: pricingData.sold_quickly ? 1.0 : 0.7
    });
  }, [trackSuccess]);

  // Track buyer preference
  const trackBuyerPreference = useCallback(async (preferenceData: {
    buyer_id: number;
    preferred_specs: Record<string, any>;
    purchase_frequency?: string;
    avg_budget?: number;
  }) => {
    await trackSuccess({
      pattern_type: 'buyer_preference',
      pattern_data: preferenceData,
      success_score: 0.9
    });
  }, [trackSuccess]);

  // Track quick deal closure
  const trackQuickClose = useCallback(async (dealData: {
    time_to_close_minutes: number;
    diamond_specs: Record<string, any>;
    final_price: number;
    negotiation_rounds: number;
  }) => {
    const success_score = dealData.time_to_close_minutes < 30 ? 1.0 : 0.8;
    
    await trackSuccess({
      pattern_type: 'quick_close',
      pattern_data: dealData,
      success_score
    });

    await trackTransaction('quick_response', dealData);
  }, [trackSuccess, trackTransaction]);

  return {
    isLearning,
    recommendations,
    trackSuccess,
    trackTransaction,
    getRecommendations,
    trackMatchSuccess,
    trackPricingPattern,
    trackBuyerPreference,
    trackQuickClose
  };
}
