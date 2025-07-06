-- Add unique constraint on certificate_number per user to prevent duplicates
ALTER TABLE public.inventory 
ADD CONSTRAINT unique_certificate_per_user 
UNIQUE (certificate_number, user_id);

-- Create function to check for existing certificate before upload
CREATE OR REPLACE FUNCTION public.check_certificate_exists(
  p_certificate_number bigint,
  p_user_id bigint
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.inventory 
    WHERE certificate_number = p_certificate_number 
    AND user_id = p_user_id
    AND deleted_at IS NULL
  );
END;
$$;