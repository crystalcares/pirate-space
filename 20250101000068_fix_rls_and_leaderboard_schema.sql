/*
          # [Fix RLS Policies and Update Market Data Schema]
          This migration script addresses several issues:
          1.  It corrects the Row Level Security (RLS) policies for the `testimonials` and `market_data` tables to resolve persistent "schema cache" errors.
          2.  It modifies the `market_data` table to allow for more flexible, text-based input for market statistics.

          ## Query Description: [This operation will reset security policies on the 'testimonials' and 'market_data' tables and alter the 'market_data' table structure. This is a safe operation designed to fix access errors and should not result in data loss. However, backing up your data is always recommended before running migrations.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Tables affected: `testimonials`, `market_data`
          - Columns altered in `market_data`: `last_price`, `change_24h`, `volume_24h` will be changed to TEXT type.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Admin privileges for write access, public for read access]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low. This is a quick metadata and policy update.]
          */

-- Step 1: Fix Testimonials RLS Policies
DROP POLICY IF EXISTS "Allow public read access" ON public.testimonials;
DROP POLICY IF EXISTS "Allow full access for admins" ON public.testimonials;

CREATE POLICY "Allow public read access" ON "public"."testimonials"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow full access for admins" ON "public"."testimonials"
AS PERMISSIVE FOR ALL
TO public
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Step 2: Fix Market Data RLS Policies
DROP POLICY IF EXISTS "Allow public read access" ON public.market_data;
DROP POLICY IF EXISTS "Allow full access for admins" ON public.market_data;

CREATE POLICY "Allow public read access" ON "public"."market_data"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow full access for admins" ON "public"."market_data"
AS PERMISSIVE FOR ALL
TO public
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Step 3: Alter market_data table to allow text input for stats
ALTER TABLE public.market_data
ALTER COLUMN last_price TYPE TEXT,
ALTER COLUMN change_24h TYPE TEXT,
ALTER COLUMN volume_24h TYPE TEXT;
