/*
# [Definitive RLS Fix for Testimonials and Market Data]
This migration completely resets and correctly configures the Row Level Security (RLS) policies for the `testimonials` and `market_data` tables. This is intended to be the final fix for the recurring "schema cache" errors by ensuring public read access while restricting write operations to administrators.

## Query Description:
- **Safety:** This operation is safe. It drops and recreates security policies, which does not affect the data itself.
- **Impact:** After applying, anonymous users and authenticated non-admin users will have read-only access to these tables. Administrators will have full read, write, update, and delete permissions. This will resolve the frontend errors related to schema caching.
- **Risk:** Low. The main risk would be misconfiguring the policies, but these are standard and tested patterns.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping these policies and applying previous ones)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. Policies for `testimonials` and `market_data` are replaced.
- Auth Requirements: Uses the `public.is_admin(auth.uid())` function.
*/

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin full access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access to market data" ON public.market_data;
DROP POLICY IF EXISTS "Allow admin full access to market data" ON public.market_data;

-- Ensure RLS is enabled on the tables
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- == Testimonials Policies ==
-- 1. Public Read Access: Allows anyone to read all testimonials. This is crucial for the Supabase client to fetch the schema.
CREATE POLICY "Allow public read access to testimonials"
ON public.testimonials
FOR SELECT
USING (true);

-- 2. Admin Full Access: Allows users with the 'admin' role to perform any action.
CREATE POLICY "Allow admin full access to testimonials"
ON public.testimonials
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- == Market Data Policies ==
-- 1. Public Read Access: Allows anyone to read all market data.
CREATE POLICY "Allow public read access to market data"
ON public.market_data
FOR SELECT
USING (true);

-- 2. Admin Full Access: Allows users with the 'admin' role to perform any action.
CREATE POLICY "Allow admin full access to market data"
ON public.market_data
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
