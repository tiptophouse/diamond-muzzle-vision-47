
-- Add missing fields to inventory table for better 360° viewer and media support
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS v360_url text,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS certificate_image_url text,
ADD COLUMN IF NOT EXISTS gia_report_pdf text,
ADD COLUMN IF NOT EXISTS gem360_url text;

-- Update existing records to extract v360 URLs from certificate_url if they contain v360.in
UPDATE public.inventory 
SET v360_url = certificate_url 
WHERE certificate_url LIKE '%v360.in%' 
AND v360_url IS NULL;

-- Update existing records to extract gem360 URLs from certificate_url if they contain gem360
UPDATE public.inventory 
SET gem360_url = certificate_url 
WHERE certificate_url LIKE '%gem360%' 
AND gem360_url IS NULL;

-- Create index for faster v360 URL lookups
CREATE INDEX IF NOT EXISTS idx_inventory_v360_url ON public.inventory(v360_url) WHERE v360_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_gem360_url ON public.inventory(gem360_url) WHERE gem360_url IS NOT NULL;
