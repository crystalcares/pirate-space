/*
# [Fix Storage Bucket Policies]
This migration corrects the Row Level Security (RLS) policies for the `avatars` and `qrcodes` storage buckets. The previous migration failed due to a permissions error when trying to modify the `storage.objects` table, which is protected. This script safely drops any previous, potentially incorrect policies and recreates them with the correct permissions.

## Query Description:
This script ensures that:
1.  **Avatars Bucket**:
    - Files are publicly readable.
    - Any authenticated user can upload an avatar.
    - Users can only update or delete their own avatars.
2.  **QRCodes Bucket**:
    - Files are publicly readable.
    - Only users with the 'admin' role can upload, update, or delete QR codes.

This operation is safe and will not affect existing data. It only modifies access rules.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping these policies)

## Structure Details:
- Affects policies on the `storage.objects` table.

## Security Implications:
- RLS Status: Enforces RLS policies on storage buckets.
- Policy Changes: Yes
- Auth Requirements: Policies rely on `auth.uid()` and the `public.is_admin()` function.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. RLS policy checks have minimal overhead.
*/

-- Drop existing policies if they exist to ensure a clean slate
DROP POLICY IF EXISTS "Public read access on avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated user can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access on qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage qrcodes" ON storage.objects;

-- Policies for 'avatars' bucket
CREATE POLICY "Public read access on avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Authenticated user can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );


-- Policies for 'qrcodes' bucket
CREATE POLICY "Public read access on qrcodes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'qrcodes' );

CREATE POLICY "Admins can manage qrcodes"
ON storage.objects FOR ALL TO authenticated
USING ( bucket_id = 'qrcodes' AND public.is_admin(auth.uid()) )
WITH CHECK ( bucket_id = 'qrcodes' AND public.is_admin(auth.uid()) );
