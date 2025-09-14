-- Create secure admin management system
-- Remove hardcoded admin IDs and implement proper role-based access control

-- Create admin_roles table for secure admin management
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view admin roles (self-referential but secure)
CREATE POLICY "Admins can view admin roles" 
ON public.admin_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.telegram_id = (current_setting('app.current_telegram_id', true))::bigint
    AND ar.is_active = true
  )
);

-- Only super admins can modify admin roles
CREATE POLICY "Super admins can manage admin roles" 
ON public.admin_roles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.telegram_id = (current_setting('app.current_telegram_id', true))::bigint
    AND ar.role = 'super_admin'
    AND ar.is_active = true
  )
);

-- Insert initial admin (this should be the only hardcoded reference, server-side only)
INSERT INTO public.admin_roles (telegram_id, role, is_active) 
VALUES (2138564172, 'super_admin', true)
ON CONFLICT (telegram_id) DO NOTHING;

-- Create function to check admin status securely
CREATE OR REPLACE FUNCTION public.is_admin(telegram_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE telegram_id = telegram_id_param 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set session context securely
CREATE OR REPLACE FUNCTION public.set_admin_session_context(telegram_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  -- Only set context if user is actually an admin
  IF public.is_admin(telegram_id_param) THEN
    PERFORM set_config('app.current_telegram_id', telegram_id_param::text, true);
  ELSE
    RAISE EXCEPTION 'Unauthorized: Not an admin user';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_telegram_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.is_admin((current_setting('app.current_telegram_id', true))::bigint));

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_telegram_id_param BIGINT,
  action_param TEXT,
  resource_type_param TEXT DEFAULT NULL,
  resource_id_param TEXT DEFAULT NULL,
  metadata_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_telegram_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    admin_telegram_id_param,
    action_param,
    resource_type_param,
    resource_id_param,
    metadata_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;