/*
# [Operation Name]
Setup Storage Bucket Policies

## Query Description: [This script establishes Row Level Security (RLS) policies for the `avatars` and `qrcodes` storage buckets. It grants appropriate read, write, and delete permissions to users and admins, securing your file uploads. This is a safe, structural change and does not affect existing data.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Affects policies on `storage.objects` for buckets: `avatars`, `qrcodes`.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [Policies are based on `auth.uid()` and the `is_admin` function.]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Negligible performance impact.]
*/

-- Enable RLS on storage.objects if not already enabled
-- This is a safe command to run even if it's already enabled.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for 'avatars' bucket
-- 1. Allow public read access to all files in 'avatars'
CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. Allow authenticated users to upload files to their own folder in 'avatars'
CREATE POLICY "Allow authenticated uploads to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 3. Allow users to update their own files
CREATE POLICY "Allow owner to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 4. Allow users to delete their own files
CREATE POLICY "Allow owner to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);


-- Policies for 'qrcodes' bucket
-- 1. Allow public read access to all files in 'qrcodes'
CREATE POLICY "Allow public read access to qrcodes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qrcodes');

-- 2. Allow only admins to upload files to the 'qrcodes' bucket
CREATE POLICY "Allow admin uploads to qrcodes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'qrcodes' AND
  public.is_admin(auth.uid())
);

-- 3. Allow only admins to update files in the 'qrcodes' bucket
CREATE POLICY "Allow admin updates to qrcodes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'qrcodes' AND
  public.is_admin(auth.uid())
);

-- 4. Allow only admins to delete files from the 'qrcodes' bucket
CREATE POLICY "Allow admin deletes from qrcodes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'qrcodes' AND
  public.is_admin(auth.uid())
);
