/*
          # [DEFINITIVE RLS POLICY FIX]
          This migration completely resets and correctly re-implements the Row Level Security (RLS) policies for the `testimonials` and `market_data` tables. This is intended to be a permanent fix for the recurring "schema cache" errors.

          ## Query Description: [This operation resets security policies. It first drops all existing RLS policies on the specified tables to prevent conflicts, then creates new, correct policies. Public read access is granted to all users, while write access (insert, update, delete) is restricted to administrators. This is a safe operation and will not affect existing data.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Affects tables: `public.testimonials`, `public.market_data`
          - Drops all existing policies on these tables.
          - Creates new `SELECT` and `ALL` policies.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Admin role for write access]
          
          ## Performance Impact:
          - Indexes: [No change]
          - Triggers: [No change]
          - Estimated Impact: [None]
          */

-- Drop all existing policies on the tables to ensure a clean slate.
DROP POLICY IF EXISTS "Public can read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.testimonials;
DROP POLICY IF EXISTS "Public can read market data" ON public.market_data;
DROP POLICY IF EXISTS "Admins can manage market data" ON public.market_data;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.market_data;


-- Ensure RLS is enabled on both tables.
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;


-- Create new, correct policies for the 'testimonials' table.
CREATE POLICY "Public can read testimonials"
ON public.testimonials
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));


-- Create new, correct policies for the 'market_data' table.
CREATE POLICY "Public can read market data"
ON public.market_data
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage market data"
ON public.market_data
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
