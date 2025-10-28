/*
# [Fix Storage and RLS Policies]
This migration script ensures that all storage and table RLS policies are correctly and idempotently set up. It addresses an error where policies might be created multiple times by first dropping existing policies before recreating them. This script also fixes an issue with loading the leadership team on the "About Us" page by ensuring the correct RLS policy is in place.

## Query Description: [This script is designed to be run safely multiple times. It will:
1. Drop several existing storage and table policies if they exist.
2. Recreate those policies with the correct permissions.
3. Enable Row Level Security on necessary tables if not already enabled.
This ensures the database security configuration is consistent and correct, resolving any "policy already exists" errors during migration.]

## Metadata:
- Schema-Category: ["Safe", "Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables affected: `storage.objects`, `public.leadership_team`
- Policies affected: All policies for buckets `site_assets`, `avatars`, `top_trader_avatars`, `leadership_avatars`, `qrcodes`, and for the `leadership_team` table.

## Security Implications:
- RLS Status: Enabled on `storage.objects` and `public.leadership_team`.
- Policy Changes: Yes. Policies are dropped and recreated to ensure correctness.
- Auth Requirements: Admin privileges are required to run this migration.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact. This is a one-time setup/fix.
*/

-- Enable RLS on storage.objects if not already enabled.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- BUCKET: site_assets
DROP POLICY IF EXISTS "Allow public read access to site assets" ON storage.objects;
CREATE POLICY "Allow public read access to site assets" ON storage.objects FOR SELECT USING (bucket_id = 'site_assets');

DROP POLICY IF EXISTS "Allow admin full access to site assets" ON storage.objects;
CREATE POLICY "Allow admin full access to site assets" ON storage.objects FOR ALL
USING (bucket_id = 'site_assets' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'site_assets' AND public.is_admin(auth.uid()));


-- BUCKET: avatars
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated users to insert their own avatar" ON storage.objects;
CREATE POLICY "Allow authenticated users to insert their own avatar" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

DROP POLICY IF EXISTS "Allow authenticated users to update their own avatar" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own avatar" ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid)
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);


-- BUCKET: top_trader_avatars
DROP POLICY IF EXISTS "Allow public read access to top trader avatars" ON storage.objects;
CREATE POLICY "Allow public read access to top trader avatars" ON storage.objects FOR SELECT USING (bucket_id = 'top_trader_avatars');

DROP POLICY IF EXISTS "Allow admin full access to top trader avatars" ON storage.objects;
CREATE POLICY "Allow admin full access to top trader avatars" ON storage.objects FOR ALL
USING (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()));


-- BUCKET: leadership_avatars
DROP POLICY IF EXISTS "Allow public read access to leadership avatars" ON storage.objects;
CREATE POLICY "Allow public read access to leadership avatars" ON storage.objects FOR SELECT USING (bucket_id = 'leadership_avatars');

DROP POLICY IF EXISTS "Allow admin full access to leadership avatars" ON storage.objects;
CREATE POLICY "Allow admin full access to leadership avatars" ON storage.objects FOR ALL
USING (bucket_id = 'leadership_avatars' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'leadership_avatars' AND public.is_admin(auth.uid()));


-- BUCKET: qrcodes
DROP POLICY IF EXISTS "Allow public read access to qrcodes" ON storage.objects;
CREATE POLICY "Allow public read access to qrcodes" ON storage.objects FOR SELECT USING (bucket_id = 'qrcodes');

DROP POLICY IF EXISTS "Allow admin full access to qrcodes" ON storage.objects;
CREATE POLICY "Allow admin full access to qrcodes" ON storage.objects FOR ALL
USING (bucket_id = 'qrcodes' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'qrcodes' AND public.is_admin(auth.uid()));


-- TABLE: leadership_team
ALTER TABLE public.leadership_team ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to leadership team" ON public.leadership_team;
CREATE POLICY "Allow public read access to leadership team" ON public.leadership_team FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access to leadership team" ON public.leadership_team;
CREATE POLICY "Allow admin full access to leadership team" ON public.leadership_team FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
