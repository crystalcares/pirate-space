/*
          # [Fix RLS Policies for Schema Cache Errors]
          This migration script permanently resolves the "Could not find column in schema cache" errors by correctly defining Row Level Security (RLS) policies for the `testimonials` and `market_data` tables.

          ## Query Description: [This operation resets and correctly applies security policies to ensure both public read access and admin write access, which is critical for the Supabase client library to function without schema cache errors. No data will be lost.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Affects RLS policies on `public.testimonials` and `public.market_data`.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Ensures `is_admin` check for write operations.]
          
          ## Performance Impact:
          - Indexes: [No change]
          - Triggers: [No change]
          - Estimated Impact: [Negligible performance impact; primarily a security/permission fix.]
          */

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin full access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access to market_data" ON public.market_data;
DROP POLICY IF EXISTS "Allow admin full access to market_data" ON public.market_data;

--== Fix for testimonials table ==--
-- 1. Allow public read access to everyone for viewing testimonials.
CREATE POLICY "Allow public read access to testimonials"
ON public.testimonials
FOR SELECT
USING (true);

-- 2. Allow admin users to perform all actions (insert, update, delete).
CREATE POLICY "Allow admin full access to testimonials"
ON public.testimonials
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));


--== Fix for market_data table ==--
-- 1. Allow public read access to everyone for viewing the markets page.
CREATE POLICY "Allow public read access to market_data"
ON public.market_data
FOR SELECT
USING (true);

-- 2. Allow admin users to perform all actions (insert, update, delete).
CREATE POLICY "Allow admin full access to market_data"
ON public.market_data
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
