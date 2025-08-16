
-- Create SFTP accounts table
CREATE TABLE public.ftp_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id bigint NOT NULL,
  telegram_id bigint NOT NULL,
  ftp_username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  ftp_folder_path text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  password_changed_at timestamp with time zone DEFAULT now()
);

-- Create upload jobs table for tracking file processing
CREATE TABLE public.upload_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ftp_account_id uuid NOT NULL REFERENCES public.ftp_accounts(id) ON DELETE CASCADE,
  user_id bigint NOT NULL,
  filename text NOT NULL,
  file_size_bytes bigint,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'failed', 'invalid')),
  diamonds_processed integer DEFAULT 0,
  diamonds_failed integer DEFAULT 0,
  error_message text,
  processing_started_at timestamp with time zone,
  processing_completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create upload errors table for detailed error tracking
CREATE TABLE public.upload_errors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_job_id uuid NOT NULL REFERENCES public.upload_jobs(id) ON DELETE CASCADE,
  row_number integer,
  column_name text,
  error_type text NOT NULL,
  error_message text NOT NULL,
  raw_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ftp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ftp_accounts
CREATE POLICY "Users can manage their own FTP accounts" 
  ON public.ftp_accounts 
  FOR ALL 
  USING (user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0))
  WITH CHECK (user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "Admins can view all FTP accounts" 
  ON public.ftp_accounts 
  FOR SELECT 
  USING (is_current_user_admin());

-- RLS Policies for upload_jobs
CREATE POLICY "Users can view their own upload jobs" 
  ON public.upload_jobs 
  FOR SELECT 
  USING (user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0));

CREATE POLICY "System can manage upload jobs" 
  ON public.upload_jobs 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all upload jobs" 
  ON public.upload_jobs 
  FOR SELECT 
  USING (is_current_user_admin());

-- RLS Policies for upload_errors
CREATE POLICY "Users can view errors for their uploads" 
  ON public.upload_errors 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.upload_jobs 
    WHERE upload_jobs.id = upload_errors.upload_job_id 
    AND upload_jobs.user_id = COALESCE((current_setting('app.current_user_id', true))::bigint, 0)
  ));

CREATE POLICY "System can manage upload errors" 
  ON public.upload_errors 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all upload errors" 
  ON public.upload_errors 
  FOR SELECT 
  USING (is_current_user_admin());

-- Create indexes for performance
CREATE INDEX idx_ftp_accounts_user_id ON public.ftp_accounts(user_id);
CREATE INDEX idx_ftp_accounts_telegram_id ON public.ftp_accounts(telegram_id);
CREATE INDEX idx_ftp_accounts_username ON public.ftp_accounts(ftp_username);
CREATE INDEX idx_ftp_accounts_status ON public.ftp_accounts(status);

CREATE INDEX idx_upload_jobs_ftp_account_id ON public.upload_jobs(ftp_account_id);
CREATE INDEX idx_upload_jobs_user_id ON public.upload_jobs(user_id);
CREATE INDEX idx_upload_jobs_status ON public.upload_jobs(status);
CREATE INDEX idx_upload_jobs_created_at ON public.upload_jobs(created_at DESC);

CREATE INDEX idx_upload_errors_job_id ON public.upload_errors(upload_job_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ftp_accounts_updated_at 
  BEFORE UPDATE ON public.ftp_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_jobs_updated_at 
  BEFORE UPDATE ON public.upload_jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
