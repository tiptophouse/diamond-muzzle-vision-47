-- Create table for SFTP requests
CREATE TABLE public.sftp_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sftp_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all SFTP requests" 
ON public.sftp_requests 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can update SFTP requests" 
ON public.sftp_requests 
FOR UPDATE 
USING (public.is_current_user_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sftp_requests_updated_at
BEFORE UPDATE ON public.sftp_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();