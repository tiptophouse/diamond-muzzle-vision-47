
-- Create the diamond-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diamond-images',
  'diamond-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload diamond images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'diamond-images' AND auth.role() = 'authenticated');

-- Create policy to allow anyone to view diamond images (since bucket is public)
CREATE POLICY "Allow public read access to diamond images"
ON storage.objects FOR SELECT
USING (bucket_id = 'diamond-images');

-- Create policy to allow users to update their own diamond images
CREATE POLICY "Allow users to update diamond images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'diamond-images' AND auth.role() = 'authenticated');

-- Create policy to allow users to delete their own diamond images
CREATE POLICY "Allow users to delete diamond images"
ON storage.objects FOR DELETE
USING (bucket_id = 'diamond-images' AND auth.role() = 'authenticated');
