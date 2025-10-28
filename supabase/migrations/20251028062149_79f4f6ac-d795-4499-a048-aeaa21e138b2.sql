-- AI Learning System: Track patterns and improve over time

-- Store AI learning from successful matches and transactions
CREATE TABLE IF NOT EXISTS public.ai_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT NOT NULL,
  user_telegram_id BIGINT NOT NULL,
  pattern_data JSONB NOT NULL,
  success_score NUMERIC DEFAULT 1.0,
  usage_count INTEGER DEFAULT 1,
  last_applied_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_patterns_user ON public.ai_learning_patterns(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON public.ai_learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_score ON public.ai_learning_patterns(success_score DESC);

-- Track transaction outcomes for learning
CREATE TABLE IF NOT EXISTS public.ai_transaction_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID,
  user_telegram_id BIGINT NOT NULL,
  match_id UUID,
  feedback_type TEXT NOT NULL,
  outcome_data JSONB NOT NULL,
  learning_extracted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON public.ai_transaction_feedback(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_extracted ON public.ai_transaction_feedback(learning_extracted);

-- Store aggregated AI insights
CREATE TABLE IF NOT EXISTS public.ai_market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  confidence_score NUMERIC DEFAULT 0.0,
  sample_size INTEGER DEFAULT 0,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_market_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_valid_until ON public.ai_market_insights(valid_until);

-- Function to update AI patterns
CREATE OR REPLACE FUNCTION public.update_ai_learning_pattern(
  p_user_telegram_id BIGINT,
  p_pattern_type TEXT,
  p_pattern_data JSONB,
  p_success_score NUMERIC DEFAULT 1.0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pattern_id UUID;
  v_existing_pattern UUID;
BEGIN
  SELECT id INTO v_existing_pattern
  FROM public.ai_learning_patterns
  WHERE user_telegram_id = p_user_telegram_id
    AND pattern_type = p_pattern_type
    AND pattern_data @> p_pattern_data
  LIMIT 1;
  
  IF v_existing_pattern IS NOT NULL THEN
    UPDATE public.ai_learning_patterns
    SET 
      success_score = (success_score * usage_count + p_success_score) / (usage_count + 1),
      usage_count = usage_count + 1,
      last_applied_at = now(),
      updated_at = now()
    WHERE id = v_existing_pattern
    RETURNING id INTO v_pattern_id;
  ELSE
    INSERT INTO public.ai_learning_patterns (
      user_telegram_id,
      pattern_type,
      pattern_data,
      success_score
    ) VALUES (
      p_user_telegram_id,
      p_pattern_type,
      p_pattern_data,
      p_success_score
    )
    RETURNING id INTO v_pattern_id;
  END IF;
  
  RETURN v_pattern_id;
END;
$$;

-- Function to get AI recommendations
CREATE OR REPLACE FUNCTION public.get_ai_recommendations(
  p_user_telegram_id BIGINT,
  p_context_type TEXT DEFAULT 'general'
)
RETURNS TABLE (
  pattern_type TEXT,
  recommendation JSONB,
  confidence NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    alp.pattern_type,
    alp.pattern_data as recommendation,
    alp.success_score as confidence
  FROM public.ai_learning_patterns alp
  WHERE alp.user_telegram_id = p_user_telegram_id
    AND alp.usage_count >= 2
    AND alp.success_score >= 0.7
  ORDER BY alp.success_score DESC, alp.usage_count DESC
  LIMIT 10;
END;
$$;

-- Enable RLS
ALTER TABLE public.ai_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_transaction_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_market_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI patterns"
  ON public.ai_learning_patterns FOR SELECT
  USING (user_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can insert their own AI patterns"
  ON public.ai_learning_patterns FOR INSERT
  WITH CHECK (user_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can update their own AI patterns"
  ON public.ai_learning_patterns FOR UPDATE
  USING (user_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can view their own feedback"
  ON public.ai_transaction_feedback FOR SELECT
  USING (user_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Users can insert their own feedback"
  ON public.ai_transaction_feedback FOR INSERT
  WITH CHECK (user_telegram_id = get_current_user_telegram_id());

CREATE POLICY "Anyone can view market insights"
  ON public.ai_market_insights FOR SELECT
  USING (true);

-- Triggers
CREATE TRIGGER update_ai_patterns_updated_at
  BEFORE UPDATE ON public.ai_learning_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_market_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();