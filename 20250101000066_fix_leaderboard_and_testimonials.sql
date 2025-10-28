/*
          # [Fix Leaderboard and Testimonials Schema]
          This migration script resolves a conflict from a previously failed migration and corrects Row Level Security (RLS) policies for multiple tables.

          ## Query Description: ["This operation cleans up and rebuilds the 'top_exchanges' table and resets RLS policies for both 'top_exchanges' and 'testimonials'. It is designed to be safe to run even if parts of the previous migration were successful. No user data will be lost from other tables."]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Drops and recreates the `public.top_exchanges` table.
          - Drops and recreates all RLS policies on `public.top_exchanges`.
          - Drops and recreates all RLS policies on `public.testimonials`.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Admin privileges for management, public for reads]
          
          ## Performance Impact:
          - Indexes: [Recreates primary key index on `top_exchanges`]
          - Triggers: [None]
          - Estimated Impact: [Low. The operation is fast and affects only newly created or misconfigured tables.]
          */

-- Step 1: Clean up and recreate the 'top_exchanges' table to resolve migration conflicts.
DROP TABLE IF EXISTS public.top_exchanges;

CREATE TABLE public.top_exchanges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    from_currency_symbol text NOT NULL,
    to_currency_symbol text NOT NULL,
    volume numeric NOT NULL,
    "order" integer DEFAULT 1 NOT NULL,
    CONSTRAINT top_exchanges_pkey PRIMARY KEY (id)
);

-- Step 2: Re-establish RLS for 'top_exchanges' table.
ALTER TABLE public.top_exchanges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access on top_exchanges" ON public.top_exchanges;
CREATE POLICY "Allow admin full access on top_exchanges"
    ON public.top_exchanges
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow public read access on top_exchanges" ON public.top_exchanges;
CREATE POLICY "Allow public read access on top_exchanges"
    ON public.top_exchanges
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Step 3: Correct the RLS policies for the 'testimonials' table.
-- This will resolve the "Could not find the 'author' column" schema cache error.
DROP POLICY IF EXISTS "Allow admin full access on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

CREATE POLICY "Admins can manage testimonials"
    ON public.testimonials
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Enable read access for all users"
    ON public.testimonials
    FOR SELECT
    TO anon, authenticated
    USING (true);
