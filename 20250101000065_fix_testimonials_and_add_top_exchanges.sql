/*
          # [Fix Testimonials RLS and Add Top Exchanges Table]
          This migration corrects the Row Level Security (RLS) policies for the 'testimonials' table to resolve schema cache errors on the client. It also introduces a new 'top_exchanges' table to allow manual curation of top exchange pairs for the admin leaderboard.

          ## Query Description: [This operation will first drop and recreate RLS policies on the 'testimonials' table. This is a safe operation that only adjusts permissions and does not affect existing data. It then creates a new 'top_exchanges' table and enables RLS, granting read access to the public and full access to administrators. No existing data is at risk.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - **testimonials**: Policies updated.
          - **top_exchanges**: New table created.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Admin role for write access]
          
          ## Performance Impact:
          - Indexes: [Primary key index created on new table]
          - Triggers: [None]
          - Estimated Impact: [Low]
          */

-- 1. Fix Testimonials RLS Policies
-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access" ON "public"."testimonials";
DROP POLICY IF EXISTS "Allow admin full access" ON "public"."testimonials";

-- Allow anyone to read all testimonial columns, fixing the schema cache issue
CREATE POLICY "Allow public read access" ON "public"."testimonials"
FOR SELECT USING (true);

-- Allow admins to perform all operations
CREATE POLICY "Allow admin full access" ON "public"."testimonials"
FOR ALL USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- 2. Create Top Exchanges Table
CREATE TABLE public.top_exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order" INT NOT NULL DEFAULT 0,
    from_currency_symbol TEXT NOT NULL,
    to_currency_symbol TEXT NOT NULL,
    volume NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS and set policies for the new table
ALTER TABLE public.top_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on top exchanges" ON "public"."top_exchanges"
FOR SELECT USING (true);

CREATE POLICY "Allow admin full access on top exchanges" ON "public"."top_exchanges"
FOR ALL USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
