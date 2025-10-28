/*
          # [Schema & Storage Initialization]
          This migration sets up all necessary Supabase Storage buckets and applies Row Level Security (RLS) policies to ensure the application functions correctly. It also fixes a data access issue on the "About Us" page.

          ## Query Description: [This script is critical for the application's file upload and data display features. It creates five storage buckets for avatars, logos, and QR codes. It then applies security policies to control who can read, upload, update, and delete files in these buckets. Finally, it enables RLS on the `leadership_team` table to make its content publicly visible, fixing a key bug. This migration is safe to run on a new project and is essential for core functionality.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Security"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Creates Storage Buckets: `site_assets`, `avatars`, `top_trader_avatars`, `leadership_avatars`, `qrcodes`.
          - Creates RLS Policies for all new storage buckets.
          - Enables RLS on `public.leadership_team`.
          - Creates RLS Policy for `public.leadership_team`.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Policies distinguish between anonymous users, authenticated users, and admins.]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low. RLS checks add minimal overhead but are necessary for security.]
          */

-- 1. Create Storage Buckets
-- This section ensures all required storage buckets exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('site_assets', 'site_assets', true, 5242880, '{"image/png", "image/jpeg", "image/gif", "image/svg+xml"}'),
    ('avatars', 'avatars', true, 5242880, '{"image/png", "image/jpeg", "image/gif"}'),
    ('top_trader_avatars', 'top_trader_avatars', true, 5242880, '{"image/png", "image/jpeg", "image/gif"}'),
    ('leadership_avatars', 'leadership_avatars', true, 5242880, '{"image/png", "image/jpeg", "image/gif"}'),
    ('qrcodes', 'qrcodes', true, 5242880, '{"image/png", "image/jpeg"}')
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies for `site_assets` bucket (logo)
-- Admins can manage all assets. Everyone can read them.
CREATE POLICY "Allow admin full access to site assets"
ON storage.objects FOR ALL
USING ( bucket_id = 'site_assets' AND is_admin(auth.uid()) )
WITH CHECK ( bucket_id = 'site_assets' AND is_admin(auth.uid()) );

CREATE POLICY "Allow public read access to site assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site_assets' );

-- 3. RLS Policies for `avatars` bucket (user profiles)
-- Users can manage their own avatar inside a folder named with their user_id. Everyone can read.
CREATE POLICY "Allow individual user avatar access"
ON storage.objects FOR ALL
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 4. RLS Policies for `top_trader_avatars` bucket
-- Admins can manage all avatars. Everyone can read them.
CREATE POLICY "Allow admin full access to top trader avatars"
ON storage.objects FOR ALL
USING ( bucket_id = 'top_trader_avatars' AND is_admin(auth.uid()) )
WITH CHECK ( bucket_id = 'top_trader_avatars' AND is_admin(auth.uid()) );

CREATE POLICY "Allow public read access to top trader avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'top_trader_avatars' );

-- 5. RLS Policies for `leadership_avatars` bucket
-- Admins can manage all avatars. Everyone can read them.
CREATE POLICY "Allow admin full access to leadership avatars"
ON storage.objects FOR ALL
USING ( bucket_id = 'leadership_avatars' AND is_admin(auth.uid()) )
WITH CHECK ( bucket_id = 'leadership_avatars' AND is_admin(auth.uid()) );

CREATE POLICY "Allow public read access to leadership avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'leadership_avatars' );

-- 6. RLS Policies for `qrcodes` bucket
-- Admins can manage all QR codes. Everyone can read them.
CREATE POLICY "Allow admin full access to qrcodes"
ON storage.objects FOR ALL
USING ( bucket_id = 'qrcodes' AND is_admin(auth.uid()) )
WITH CHECK ( bucket_id = 'qrcodes' AND is_admin(auth.uid()) );

CREATE POLICY "Allow public read access to qrcodes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'qrcodes' );

-- 7. RLS Policy for `leadership_team` table
-- This fixes the "failed to load leadership team" error on the About Us page.
ALTER TABLE public.leadership_team ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to leadership team" ON public.leadership_team;

CREATE POLICY "Allow public read access to leadership team"
ON public.leadership_team
FOR SELECT
USING (true);
