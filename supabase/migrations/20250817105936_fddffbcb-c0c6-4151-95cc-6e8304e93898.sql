
-- Add columns to track user registration attempts and success
ALTER TABLE public.group_cta_clicks 
ADD COLUMN registration_attempted boolean DEFAULT false,
ADD COLUMN registration_success boolean DEFAULT false,
ADD COLUMN registration_token text,
ADD COLUMN registration_error text,
ADD COLUMN fastapi_response jsonb;

-- Add index for better query performance on registration tracking
CREATE INDEX idx_group_cta_clicks_registration ON public.group_cta_clicks(registration_attempted, registration_success);
