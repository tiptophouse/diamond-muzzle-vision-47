
-- Fix premium user assignments: First 100 users = premium, rest = free
-- Step 1: Reset ALL users to free status first
UPDATE user_profiles 
SET 
  is_premium = false, 
  subscription_plan = 'free',
  updated_at = NOW();

-- Step 2: Set ONLY the first 100 users (by created_at) to premium
WITH first_100_users AS (
  SELECT telegram_id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as user_rank
  FROM user_profiles
  WHERE created_at IS NOT NULL
)
UPDATE user_profiles 
SET 
  is_premium = true, 
  subscription_plan = 'premium',
  updated_at = NOW()
WHERE telegram_id IN (
  SELECT telegram_id 
  FROM first_100_users 
  WHERE user_rank <= 100
);

-- Update user_analytics table to match the subscription status
UPDATE user_analytics 
SET subscription_status = 'free', updated_at = NOW();

UPDATE user_analytics 
SET subscription_status = 'premium', updated_at = NOW()
WHERE telegram_id IN (
  SELECT telegram_id FROM (
    SELECT telegram_id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as user_rank
    FROM user_profiles
    WHERE created_at IS NOT NULL
  ) ranked_users
  WHERE user_rank <= 100
);
