/*
          # [Definitive RLS Policy Fix for Testimonials and Market Data]
          This migration script provides a definitive fix for the persistent "schema cache" errors by completely resetting and correctly re-applying the Row Level Security (RLS) policies for the `testimonials` and `market_data` tables.

          ## Query Description: [This operation will drop and recreate security policies. It is designed to fix permission errors that prevent the admin panel from functioning correctly. It ensures public read access is granted while write operations are restricted to administrators, which is a safe and standard configuration. There is no risk to existing data.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Affects policies on `public.testimonials` and `public.market_data`.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Admin role for write access]
          
          ## Performance Impact:
          - Indexes: [No change]
          - Triggers: [No change]
          - Estimated Impact: [None]
          */

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public can read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can read market data" ON public.market_data;
DROP POLICY IF EXISTS "Admins can manage market data" ON public.market_data;

-- Re-enable RLS just in case it was disabled during troubleshooting
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create a broad SELECT policy for anonymous and authenticated users.
-- This is required for the Supabase client library to build its schema cache correctly.
CREATE POLICY "Public can read testimonials" ON public.testimonials
FOR SELECT
USING (true);

-- Create a restrictive policy for all write operations (INSERT, UPDATE, DELETE)
-- only allowing users with the 'admin' role.
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Apply the same logic to the market_data table
CREATE POLICY "Public can read market data" ON public.market_data
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage market data" ON public.market_data
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
