/*
          # Create Storage Bucket for Leaderboard Avatars
          This migration creates a new storage bucket named `top_trader_avatars` and sets up the necessary security policies for managing avatar images for the "Hall of Captains" leaderboard.

          ## Query Description: 
          - **Bucket Creation**: Creates a new public bucket `top_trader_avatars` for storing images.
          - **Public Access**: Adds a policy to allow anyone to view (read) the avatars. This is necessary for them to be displayed on the public-facing leaderboard.
          - **Admin-Only Management**: Adds policies to ensure that only users with the 'admin' role can upload, update, or delete avatars. This protects the integrity of the leaderboard content.
          This operation is safe and does not affect any existing data.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Creates new bucket: `storage.buckets('top_trader_avatars')`
          - Creates 4 new policies on `storage.objects`

          ## Security Implications:
          - RLS Status: Enabled on `storage.objects`
          - Policy Changes: Yes, adds 4 new policies.
          - Auth Requirements: Management actions (insert, update, delete) are restricted to authenticated admins.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

-- 1. Create the storage bucket for top trader avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('top_trader_avatars', 'top_trader_avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Add policies for the new bucket

-- Allow public read access to everyone
CREATE POLICY "Allow public read access to top trader avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'top_trader_avatars' );

-- Allow authenticated admins to upload avatars
CREATE POLICY "Allow admin to upload top trader avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );

-- Allow authenticated admins to update their own avatars
CREATE POLICY "Allow admin to update top trader avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );

-- Allow authenticated admins to delete their own avatars
CREATE POLICY "Allow admin to delete top trader avatars"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()) );
