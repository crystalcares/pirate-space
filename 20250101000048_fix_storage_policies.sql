/*
          # [Operation Name]
          Fix Storage Bucket Policies

          ## Query Description: "This operation ensures the necessary storage buckets ('top_trader_avatars', 'qrcodes') exist and resets their security policies. It drops any potentially conflicting old policies and creates new ones that allow public read access but restrict modifications (uploads, updates, deletes) to authenticated admin users only. This is a safe, idempotent operation."

          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Buckets Affected: `storage.buckets` ('top_trader_avatars', 'qrcodes')
          - Policies Affected: `storage.objects` policies for the above buckets.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: Modifies storage policies to require admin role for writes.
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Negligible performance impact.]
          */

-- Ensure the 'top_trader_avatars' bucket exists and is public.
INSERT INTO storage.buckets (id, name, public)
VALUES ('top_trader_avatars', 'top_trader_avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Ensure the 'qrcodes' bucket exists and is public (for payment methods).
INSERT INTO storage.buckets (id, name, public)
VALUES ('qrcodes', 'qrcodes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to ensure a clean slate.
DROP POLICY IF EXISTS "Allow public read on top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin management on top_trader_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on qrcodes" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin management on qrcodes" ON storage.objects;

-- Create policies for 'top_trader_avatars'
CREATE POLICY "Allow public read on top_trader_avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'top_trader_avatars');

CREATE POLICY "Allow admin management on top_trader_avatars"
ON storage.objects FOR INSERT, UPDATE, DELETE
TO authenticated
WITH CHECK (bucket_id = 'top_trader_avatars' AND public.is_admin(auth.uid()));

-- Create policies for 'qrcodes'
CREATE POLICY "Allow public read on qrcodes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qrcodes');

CREATE POLICY "Allow admin management on qrcodes"
ON storage.objects FOR INSERT, UPDATE, DELETE
TO authenticated
WITH CHECK (bucket_id = 'qrcodes' AND public.is_admin(auth.uid()));
