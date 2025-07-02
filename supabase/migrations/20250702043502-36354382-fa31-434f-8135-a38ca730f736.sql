-- Create RLS policies for the app_settings table

-- Policy to allow admin users to read all app settings
CREATE POLICY "Admin users can view all app settings" ON public.app_settings
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.app_settings admin_check 
    WHERE admin_check.setting_key = 'admin_telegram_id' 
    AND (
      CASE 
        WHEN jsonb_typeof(admin_check.setting_value) = 'number' THEN admin_check.setting_value::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'value' THEN (admin_check.setting_value->>'value')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'admin_telegram_id' THEN (admin_check.setting_value->>'admin_telegram_id')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'string' THEN (admin_check.setting_value#>>'{}')::bigint
        ELSE 2138564172
      END
    ) = (
      SELECT COALESCE(current_setting('app.current_user_id', true)::bigint, 0)
    )
  )
);

-- Policy to allow admin users to insert new app settings
CREATE POLICY "Admin users can insert app settings" ON public.app_settings
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_settings admin_check 
    WHERE admin_check.setting_key = 'admin_telegram_id' 
    AND (
      CASE 
        WHEN jsonb_typeof(admin_check.setting_value) = 'number' THEN admin_check.setting_value::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'value' THEN (admin_check.setting_value->>'value')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'admin_telegram_id' THEN (admin_check.setting_value->>'admin_telegram_id')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'string' THEN (admin_check.setting_value#>>'{}')::bigint
        ELSE 2138564172
      END
    ) = (
      SELECT COALESCE(current_setting('app.current_user_id', true)::bigint, 0)
    )
  )
);

-- Policy to allow admin users to update app settings
CREATE POLICY "Admin users can update app settings" ON public.app_settings
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.app_settings admin_check 
    WHERE admin_check.setting_key = 'admin_telegram_id' 
    AND (
      CASE 
        WHEN jsonb_typeof(admin_check.setting_value) = 'number' THEN admin_check.setting_value::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'value' THEN (admin_check.setting_value->>'value')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'admin_telegram_id' THEN (admin_check.setting_value->>'admin_telegram_id')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'string' THEN (admin_check.setting_value#>>'{}')::bigint
        ELSE 2138564172
      END
    ) = (
      SELECT COALESCE(current_setting('app.current_user_id', true)::bigint, 0)
    )
  )
);

-- Policy to allow admin users to delete app settings
CREATE POLICY "Admin users can delete app settings" ON public.app_settings
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.app_settings admin_check 
    WHERE admin_check.setting_key = 'admin_telegram_id' 
    AND (
      CASE 
        WHEN jsonb_typeof(admin_check.setting_value) = 'number' THEN admin_check.setting_value::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'value' THEN (admin_check.setting_value->>'value')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'object' AND admin_check.setting_value ? 'admin_telegram_id' THEN (admin_check.setting_value->>'admin_telegram_id')::bigint
        WHEN jsonb_typeof(admin_check.setting_value) = 'string' THEN (admin_check.setting_value#>>'{}')::bigint
        ELSE 2138564172
      END
    ) = (
      SELECT COALESCE(current_setting('app.current_user_id', true)::bigint, 0)
    )
  )
);

-- Policy to allow regular users to read specific public app settings (like manual_authorization_enabled)
CREATE POLICY "Users can view public app settings" ON public.app_settings
FOR SELECT 
USING (
  setting_key IN ('manual_authorization_enabled') 
  AND COALESCE(current_setting('app.current_user_id', true)::bigint, 0) > 0
);