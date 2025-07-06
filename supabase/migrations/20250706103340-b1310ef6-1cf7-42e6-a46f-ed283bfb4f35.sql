-- Function to remove duplicate inventory entries based on certificate_number
-- Keeps the most recent record (by updated_at) for each certificate_number per user
CREATE OR REPLACE FUNCTION public.remove_duplicate_certificates(p_user_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_deleted_count integer;
BEGIN
  -- Delete duplicates, keeping only the most recent record for each certificate_number
  WITH ranked_inventory AS (
    SELECT 
      id,
      certificate_number,
      ROW_NUMBER() OVER (
        PARTITION BY certificate_number, user_id 
        ORDER BY updated_at DESC, created_at DESC
      ) as rn
    FROM public.inventory
    WHERE user_id = p_user_id
    AND certificate_number IS NOT NULL
    AND deleted_at IS NULL
  )
  DELETE FROM public.inventory
  WHERE id IN (
    SELECT id 
    FROM ranked_inventory 
    WHERE rn > 1
  );
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error removing duplicates: %', SQLERRM;
END;
$function$;

-- Function to remove ALL duplicates for admin users across all users
CREATE OR REPLACE FUNCTION public.remove_all_duplicate_certificates()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_deleted_count integer;
BEGIN
  -- Delete duplicates across all users, keeping only the most recent record for each certificate_number per user
  WITH ranked_inventory AS (
    SELECT 
      id,
      certificate_number,
      user_id,
      ROW_NUMBER() OVER (
        PARTITION BY certificate_number, user_id 
        ORDER BY updated_at DESC, created_at DESC
      ) as rn
    FROM public.inventory
    WHERE certificate_number IS NOT NULL
    AND deleted_at IS NULL
  )
  DELETE FROM public.inventory
  WHERE id IN (
    SELECT id 
    FROM ranked_inventory 
    WHERE rn > 1
  );
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error removing all duplicates: %', SQLERRM;
END;
$function$;