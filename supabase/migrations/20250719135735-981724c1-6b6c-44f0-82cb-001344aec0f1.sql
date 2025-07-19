-- Enable real-time for user_profiles table
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_profiles;

-- Enable real-time for user_logins table  
ALTER TABLE public.user_logins REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_logins;