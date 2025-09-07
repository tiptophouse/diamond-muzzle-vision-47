-- Fix database function security warnings by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Create error_reports table for error monitoring
CREATE TABLE public.error_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL CHECK (error_type IN ('javascript', 'network', 'authentication', 'api', 'user_action')),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID,
  additional_context JSONB DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on error_reports
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for error_reports
CREATE POLICY "Allow system to insert error reports" 
ON public.error_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow system to select error reports" 
ON public.error_reports 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_error_reports_updated_at
BEFORE UPDATE ON public.error_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();