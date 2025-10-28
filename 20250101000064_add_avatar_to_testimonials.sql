/*
          # [Operation Name]
          Add Avatar Support for Testimonials

          ## Query Description: [This migration enhances the testimonials feature by adding support for custom avatars. It adds a new `avatar_url` column to the `testimonials` table, creates a dedicated storage bucket named `testimonial_avatars` for storing these images, and configures the necessary security policies to allow administrators to manage them. This is a non-destructive operation and is fully reversible.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Adds column `avatar_url` to `public.testimonials`.
          - Creates storage bucket `testimonial_avatars`.
          - Adds RLS policies to `storage.objects` for the new bucket.
          - Refreshes RLS policies on `public.testimonials` to ensure admin access.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Admin privileges are required to manage avatars and testimonials. Public read access is granted for avatars.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

-- 1. Add avatar_url column to testimonials table
ALTER TABLE public.testimonials
ADD COLUMN avatar_url TEXT;

-- 2. Create a new storage bucket for testimonial avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial_avatars', 'testimonial_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Add RLS policies for the new bucket
-- Allow public read access
CREATE POLICY "Allow public read access on testimonial avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'testimonial_avatars' );

-- Allow admin full access
CREATE POLICY "Allow admin management of testimonial avatars"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'testimonial_avatars' AND (select is_admin(auth.uid())) )
WITH CHECK ( bucket_id = 'testimonial_avatars' AND (select is_admin(auth.uid())) );

-- 4. Refresh RLS policies on testimonials table to ensure admins have full control
DROP POLICY IF EXISTS "Allow admin to manage testimonials" ON public.testimonials;
CREATE POLICY "Allow admin to manage testimonials"
ON public.testimonials
FOR ALL
USING ((select is_admin(auth.uid())))
WITH CHECK ((select is_admin(auth.uid())));

DROP POLICY IF EXISTS "Enable read access for all users" ON public.testimonials;
CREATE POLICY "Enable read access for all users"
ON public.testimonials
FOR SELECT
USING (true);
