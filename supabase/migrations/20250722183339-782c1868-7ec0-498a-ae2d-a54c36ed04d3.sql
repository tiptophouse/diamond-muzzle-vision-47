-- Create a public function to get the total count of available diamonds
CREATE OR REPLACE FUNCTION public.get_public_diamond_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COUNT(*)::integer 
  FROM public.inventory 
  WHERE store_visible = true 
  AND deleted_at IS NULL;
$$;