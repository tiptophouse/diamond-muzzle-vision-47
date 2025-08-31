-- Remove ftp_accounts table and dependencies since credentials should not be stored in DB
-- This aligns with the requirement that FastAPI provisions credentials on-demand only

-- First remove the foreign key constraint from upload_jobs
ALTER TABLE public.upload_jobs DROP CONSTRAINT IF EXISTS upload_jobs_ftp_account_id_fkey;

-- Remove the ftp_account_id column from upload_jobs since we won't store SFTP account references
ALTER TABLE public.upload_jobs DROP COLUMN IF EXISTS ftp_account_id;

-- Now safely drop the ftp_accounts table
DROP TABLE IF EXISTS public.ftp_accounts;