/*
# [Fix RLS Policies and Update Market Data Types]
This migration addresses several issues:
1.  Fixes Row Level Security (RLS) policies for the `testimonials` and `market_data` tables to resolve "schema cache" errors by granting public read access.
2.  Changes the data types for `last_price`, `change_24h`, and `volume_24h` columns in the `market_data` table from `numeric` to `text`. This provides greater flexibility for admins to enter custom-formatted strings.

## Query Description: [This operation modifies table structures and security policies. The change of `market_data` columns to `text` is a structural change that is not easily reversible and may affect how you query this data in the future if you expect numeric types. No data will be lost, as existing numeric values will be cast to text.]

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Medium"]
- Requires-Backup: [false]
- Reversible: [false]

## Structure Details:
- Tables affected: `public.testimonials`, `public.market_data`
- Columns modified: `market_data.last_price`, `market_data.change_24h`, `market_data.volume_24h`
- RLS Policies created/updated for `testimonials` and `market_data`.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [Admin for write, public for read]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. Querying text columns may be slightly slower than numeric ones, but this is negligible for this use case.]
*/

-- 1. Update market_data column types for flexibility
ALTER TABLE public.market_data
  ALTER COLUMN last_price TYPE text,
  ALTER COLUMN change_24h TYPE text,
  ALTER COLUMN volume_24h TYPE text;

-- 2. Fix Testimonials RLS Policies
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin full access to testimonials" ON public.testimonials;

CREATE POLICY "Allow public read access to testimonials"
  ON public.testimonials
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin full access to testimonials"
  ON public.testimonials
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. Fix Market Data RLS Policies
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to market data" ON public.market_data;
DROP POLICY IF EXISTS "Allow admin full access to market data" ON public.market_data;

CREATE POLICY "Allow public read access to market data"
  ON public.market_data
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin full access to market data"
  ON public.market_data
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
