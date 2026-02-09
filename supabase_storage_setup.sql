-- Create storage bucket for files
-- Run this in Supabase SQL Editor

-- Enable storage
insert into storage.buckets (id, name, public)
values ('files', 'files', true)
on conflict (id) do nothing;

-- Set up storage policies
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'files');

-- Allow authenticated uploads
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Allow authenticated deletes
CREATE POLICY "Authenticated Deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files');
