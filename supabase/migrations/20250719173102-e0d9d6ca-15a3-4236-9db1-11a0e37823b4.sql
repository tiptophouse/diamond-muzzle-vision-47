-- Remove fake mock user data
-- Delete fake users from user_analytics first (due to potential foreign key constraints)
DELETE FROM public.user_analytics WHERE telegram_id IN (1002, 1003, 1005);

-- Delete fake user logins if any
DELETE FROM public.user_logins WHERE telegram_id IN (1002, 1003, 1005);

-- Delete fake user behavior analytics if any
DELETE FROM public.user_behavior_analytics WHERE telegram_id IN (1002, 1003, 1005);

-- Delete fake user activity logs if any
DELETE FROM public.user_activity_log WHERE telegram_id IN (1002, 1003, 1005);

-- Finally delete the fake user profiles
DELETE FROM public.user_profiles WHERE telegram_id IN (1002, 1003, 1005);

-- Clean up any other fake data with obviously fake patterns
DELETE FROM public.user_profiles WHERE 
  telegram_id < 10000 AND 
  first_name IN ('Sarah', 'Mike', 'David', 'Test', 'Demo', 'Admin') AND
  phone_number LIKE '+12345%';