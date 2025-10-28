/*
          # [RLS Policy Reset for Content Tables]
          This migration script performs a definitive reset of the Row Level Security (RLS) policies for the `testimonials` and `market_data` tables. It is designed to resolve persistent "schema cache" errors by ensuring public read access is correctly configured.

          ## Query Description: [This operation will drop and recreate security policies on the `testimonials` and `market_data` tables. It is a safe, non-destructive operation designed to fix access permissions. No data will be lost.]
          
          ## Metadata:
          - Schema-Category: ["Safe", "Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Tables affected: `public.testimonials`, `public.market_data`
          - Operations: `DROP POLICY`, `CREATE POLICY`, `ALTER TABLE`
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Correctly separates public read access from admin-only write access.]
          
          ## Performance Impact:
          - Indexes: [Not Affected]
          - Triggers: [Not Affected]
          - Estimated Impact: [None]
          */

-- Drop existing policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Public can read all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

-- Create new, correct policies for testimonials
-- 1. Public Read Access: Anyone can read all columns. This is crucial for the client-side schema cache.
CREATE POLICY "Public can read all testimonials" ON public.testimonials FOR SELECT USING (true);
-- 2. Admin Full Access: Admins can do anything.
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Ensure RLS is enabled on the table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;


-- Drop existing policies on market_data
DROP POLICY IF EXISTS "Public can read all market data" ON public.market_data;
DROP POLICY IF EXISTS "Admins can manage market data" ON public.market_data;

-- Create new, correct policies for market_data
-- 1. Public Read Access: Anyone can read all columns.
CREATE POLICY "Public can read all market data" ON public.market_data FOR SELECT USING (true);
-- 2. Admin Full Access: Admins can do anything.
CREATE POLICY "Admins can manage market data" ON public.market_data FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Ensure RLS is enabled on the table
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
