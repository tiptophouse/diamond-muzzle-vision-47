-- Fix RLS policies to work with FastAPI authentication instead of Supabase Auth
-- The app uses FastAPI JWT + session context (app.current_user_id), not auth.uid()

-- Drop the old policy that relies on auth.uid()
DROP POLICY IF EXISTS "Users can access their own inventory" ON public.inventory;

-- Create new policy that uses session context set by FastAPI auth
CREATE POLICY "Users can access their own inventory via session context" 
ON public.inventory
FOR ALL
USING (
  user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
)
WITH CHECK (
  user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
);

-- Also add a policy for admins to manage all inventory
CREATE POLICY "Admins can manage all inventory" 
ON public.inventory
FOR ALL
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Add helpful comment
COMMENT ON POLICY "Users can access their own inventory via session context" ON public.inventory IS 
'Allows users to access their inventory when authenticated via FastAPI JWT. Session context app.current_user_id is set during FastAPI authentication flow.';