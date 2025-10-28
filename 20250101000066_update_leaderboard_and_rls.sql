/*
# [Combined Migration: Fix Testimonials RLS and Add Top Exchanges]
This migration addresses two separate issues:
1.  **Testimonials RLS Fix:** Corrects the Row Level Security policies on the `testimonials` table to resolve a "column not found in schema cache" error. It ensures that administrators have full control while the public can read all testimonial data.
2.  **Top Exchanges Feature:** Adds a new table `top_exchanges` to allow manual management of a "Top Exchanges" list in the admin panel.

## Query Description:
- **Testimonials:** Drops and recreates policies to grant broad read access to everyone and full management rights to admins. This is a low-risk change aimed at fixing a permission bug.
- **Top Exchanges:** Creates a new table and its associated policies. This is a structural addition and has no impact on existing data.

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (manually, by dropping the new table and reverting policies)

## Structure Details:
- **Modified Table:** `public.testimonials` (Policies only)
- **New Table:** `public.top_exchanges`
  - `id`: UUID, Primary Key
  - `from_currency_symbol`: TEXT
  - `to_currency_symbol`: TEXT
  - `volume`: NUMERIC
  - `order`: INT4
  - `created_at`: TIMESTAMPTZ

## Security Implications:
- RLS Status: Enabled on `testimonials` and `top_exchanges`.
- Policy Changes: Yes. Policies for `testimonials` are corrected. New policies for `top_exchanges` are added.
- Auth Requirements: Management of both tables requires admin privileges via the `is_admin()` function.

## Performance Impact:
- Indexes: Primary key index added on `top_exchanges.id`.
- Triggers: None.
- Estimated Impact: Negligible.
*/

-- Step 1: Fix Testimonials RLS Policies
-- Drop existing policies to ensure a clean slate.
DROP POLICY IF EXISTS "Public can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.testimonials;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.testimonials;
DROP POLICY IF EXISTS "Enable update for users who created" ON public.testimonials;
DROP POLICY IF EXISTS "Enable delete for users who created" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can do everything" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin full access" ON public.testimonials;

-- Create a broad read-only policy for everyone.
CREATE POLICY "Public can view all testimonials" ON public.testimonials
FOR SELECT
USING (true);

-- Create a comprehensive policy for admins to manage everything.
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- Step 2: Create Top Exchanges Table and Policies
-- Create the table to store manually added top exchanges.
CREATE TABLE public.top_exchanges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    from_currency_symbol text NOT NULL,
    to_currency_symbol text NOT NULL,
    volume numeric NOT NULL,
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT top_exchanges_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security on the new table.
ALTER TABLE public.top_exchanges ENABLE ROW LEVEL SECURITY;

-- Create a policy for public read access.
CREATE POLICY "Public can view top exchanges" ON public.top_exchanges
FOR SELECT
USING (true);

-- Create a policy for admin management.
CREATE POLICY "Admins can manage top exchanges" ON public.top_exchanges
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
