/*
# [Fix] Correct Storage Bucket Policies
[This migration corrects a syntax error in the previous storage policy definitions. It ensures that the 'top_trader_avatars' and 'qrcodes' buckets exist and have the correct, secure access policies for administrators.]

## Query Description: [This operation will drop any potentially incorrect storage policies for the 'top_trader_avatars' and 'qrcodes' buckets and recreate them with the correct syntax. It ensures that administrators have full control (upload, update, delete) over files in these buckets, while allowing public read access, which is necessary for displaying images in the app. This is a low-risk operation designed to fix a configuration error.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Buckets Affected: `storage.buckets` (top_trader_avatars, qrcodes)
- Policies Affected: Policies on `storage.objects` for the specified buckets.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes] - Corrects existing RLS policies for storage objects.
- Auth Requirements: [Admin role required for write operations]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Negligible. Affects permissions checks for storage operations.]
*/

-- 1. Create buckets if they don't exist (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('top_trader_avatars', 'top_trader_avatars', true),
  ('qrcodes', 'qrcodes', true)
ON CONFLICT (id) DO NOTHING;


-- 2. Drop old, potentially incorrect policies for 'top_trader_avatars'
DROP POLICY IF EXISTS "Admin can manage all files in top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can insert into top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update in top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete from top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files in top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage all files in qrcodes" ON storage.objects; -- Drop generic policy name
DROP POLICY IF EXISTS "Admin can manage qrcodes" ON storage.objects; -- Drop another possible generic policy name

-- 3. Create correct policies for 'top_trader_avatars'
CREATE POLICY "Admin can insert into top_trader_avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can update in top_trader_avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete from top_trader_avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view files in top_trader_avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'top_trader_avatars');


-- 4. Drop old, potentially incorrect policies for 'qrcodes'
DROP POLICY IF EXISTS "Admin can insert into qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update in qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete from qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files in qrcodes" ON storage.objects;

-- 5. Create correct policies for 'qrcodes'
CREATE POLICY "Admin can insert into qrcodes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qrcodes' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can update in qrcodes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'qrcodes' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can delete from qrcodes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'qrcodes' AND public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view files in qrcodes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qrcodes');
