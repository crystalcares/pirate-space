/*
# [Operation Name]
Create Top Trader Avatars Bucket and Policies

## Query Description: [This script ensures the storage bucket for top trader avatars exists and has the correct security policies. It is idempotent, meaning it's safe to run even if the bucket or policies already exist. It will first attempt to create the 'top_trader_avatars' bucket. Then, it removes any old policies associated with this bucket to prevent conflicts and applies a fresh set of secure policies. These new policies restrict file management (upload, update, delete) to administrators only, while allowing anyone to view the avatars.]

## Metadata:
- Schema-Category: ["Structural", "Security"]
- Impact-Level: ["Medium"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Creates storage bucket: `top_trader_avatars`
- Affects policies on table: `storage.objects`

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [Admin role required for modifications]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. Affects storage operations for a specific bucket.]
*/

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('top_trader_avatars', 'top_trader_avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Clean up any existing policies for this bucket to avoid conflicts
DROP POLICY IF EXISTS "Allow admin full access to top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated inserts for top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin read access to top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update access to top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete access to top trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can insert trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update trader avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete trader avatars" ON storage.objects;


-- 3. Create SELECT policy: Anyone can view the avatars.
CREATE POLICY "Anyone can view trader avatars"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'top_trader_avatars' );

-- 4. Create INSERT policy: Only admins can upload new avatars.
CREATE POLICY "Admin can insert trader avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );

-- 5. Create UPDATE policy: Only admins can update/replace avatars.
CREATE POLICY "Admin can update trader avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );

-- 6. Create DELETE policy: Only admins can delete avatars.
CREATE POLICY "Admin can delete trader avatars"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );
