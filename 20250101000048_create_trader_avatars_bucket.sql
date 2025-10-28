/*
# [Operation Name]
Create Storage Bucket and Policies for Top Trader Avatars

## Query Description: [This script ensures the necessary storage bucket 'top_trader_avatars' exists and has the correct security policies. It is safe to run multiple times. It will create the bucket if it's missing and reset the policies to the correct state for public reads and admin-only writes. This is crucial for allowing trader avatars to be uploaded and displayed correctly.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- storage.buckets: Inserts 'top_trader_avatars' if not present.
- storage.objects: Creates/replaces policies for 'top_trader_avatars'.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [Policies require 'authenticated' users with an 'admin' role for write operations.]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. Affects storage operations for a specific feature.]
*/

-- Create the storage bucket if it doesn't exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('top_trader_avatars', 'top_trader_avatars', true, 5242880, '{"image/jpeg","image/png","image/gif","image/webp"}')
ON CONFLICT (id) DO NOTHING;

-- Policies for top_trader_avatars bucket
-- Drop existing policies to ensure a clean slate, this is safe
DROP POLICY IF EXISTS "Public read access for trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete trader avatars" ON storage.objects;

-- Allow public read access for all files in the bucket.
CREATE POLICY "Public read access for trader avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'top_trader_avatars' );

-- Allow authenticated admins to insert files.
CREATE POLICY "Admin can manage trader avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );

-- Allow authenticated admins to update files.
CREATE POLICY "Admin can update trader avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );

-- Allow authenticated admins to delete files.
CREATE POLICY "Admin can delete trader avatars"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );
