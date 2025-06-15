
-- Drop existing restrictive policies based on Supabase authentication
DROP POLICY IF EXISTS "Allow authenticated users to upload diamond images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update diamond images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete diamond images" ON storage.objects;

-- Create new permissive policies to allow public access for image management.
-- This is necessary because the app uses Telegram-based authentication, not Supabase's built-in auth.
-- WARNING: This makes your storage bucket publicly writable. For a production environment,
-- consider a more secure approach like using server-side uploads or signed URLs.

CREATE POLICY "Allow public uploads to diamond images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'diamond-images');

CREATE POLICY "Allow public updates for diamond images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'diamond-images');

CREATE POLICY "Allow public deletes for diamond images"
ON storage.objects FOR DELETE
USING (bucket_id = 'diamond-images');
