-- Remove ftp_accounts table since credentials should not be stored in DB
-- This aligns with the requirement that FastAPI provisions credentials on-demand only
DROP TABLE IF EXISTS public.ftp_accounts;