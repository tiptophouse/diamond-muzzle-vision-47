-- Create table for tracking group CTA clicks
CREATE TABLE IF NOT EXISTS public.group_cta_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  start_parameter TEXT NOT NULL,
  source_group_id BIGINT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.group_cta_clicks ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all clicks
CREATE POLICY "Admins can view all CTA clicks" ON public.group_cta_clicks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.app_settings 
    WHERE setting_key = 'admin_telegram_id' 
    AND (
      CASE 
        WHEN jsonb_typeof(setting_value) = 'number' THEN setting_value::bigint
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'value' THEN (setting_value->>'value')::bigint
        WHEN jsonb_typeof(setting_value) = 'object' AND setting_value ? 'admin_telegram_id' THEN (setting_value->>'admin_telegram_id')::bigint
        WHEN jsonb_typeof(setting_value) = 'string' THEN (setting_value#>>'{}')::bigint
        ELSE 2138564172
      END
    ) = (
      SELECT telegram_id FROM public.user_profiles 
      WHERE telegram_id = auth.uid()::text::bigint
      LIMIT 1
    )
  )
);

-- Create policy for users to insert their own clicks
CREATE POLICY "Users can insert their own CTA clicks" ON public.group_cta_clicks
FOR INSERT WITH CHECK (
  telegram_id = (
    SELECT telegram_id FROM public.user_profiles 
    WHERE telegram_id = auth.uid()::text::bigint
    LIMIT 1
  )
);

-- Create index for performance
CREATE INDEX idx_group_cta_clicks_telegram_id ON public.group_cta_clicks(telegram_id);
CREATE INDEX idx_group_cta_clicks_clicked_at ON public.group_cta_clicks(clicked_at);
CREATE INDEX idx_group_cta_clicks_start_parameter ON public.group_cta_clicks(start_parameter);