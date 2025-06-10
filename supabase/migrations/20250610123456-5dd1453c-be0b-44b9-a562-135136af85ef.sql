
-- Add soft delete column to inventory table
ALTER TABLE public.inventory 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Create index for better performance when filtering deleted items
CREATE INDEX idx_inventory_deleted_at ON public.inventory(deleted_at) WHERE deleted_at IS NULL;
