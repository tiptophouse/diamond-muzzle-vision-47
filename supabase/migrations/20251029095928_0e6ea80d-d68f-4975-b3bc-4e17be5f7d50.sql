-- Fix 1: Add missing last_active column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON public.user_profiles(last_active DESC);

-- Fix 2: Fix RLS policy for user_behavior_analytics to allow authenticated users to insert
DROP POLICY IF EXISTS "Users can insert their own behavior analytics" ON public.user_behavior_analytics;

CREATE POLICY "Users can insert their own behavior analytics"
ON public.user_behavior_analytics
FOR INSERT
TO authenticated
WITH CHECK (telegram_id = get_current_user_telegram_id());