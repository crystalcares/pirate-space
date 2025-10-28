/*
# [Feature] Admin Market Data Management
This migration adds the necessary database structures for admins to manage the content and data displayed on the Markets page.

## Query Description:
This script performs the following actions:
1.  **Adds new configuration keys** to the `app_config` table to allow editing the title and subtitle of the Markets page.
2.  **Creates a new table `market_data`** to store editable market information for currency pairs, such as price, 24h change, and volume. This replaces the previously hardcoded/fake data.
3.  **Enables Row Level Security (RLS)** on the new `market_data` table and applies policies to ensure that data is publicly readable but only manageable by authenticated administrators.

This is a non-destructive, structural change. No existing data is at risk.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- **Table Modified**: `app_config` (new rows inserted)
- **Table Created**: `market_data`
  - Columns: `id`, `created_at`, `order`, `from_currency_symbol`, `to_currency_symbol`, `last_price`, `change_24h_percentage`, `volume_24h_usd`
- **Policies Created**:
  - `Allow public read access on market_data`
  - `Allow admin full access on market_data`

## Security Implications:
- RLS Status: Enabled on `market_data`.
- Policy Changes: New policies are added for the `market_data` table to restrict write access to administrators.
- Auth Requirements: Admin role required for management.

## Performance Impact:
- Indexes: A primary key index is created on `market_data(id)`.
- Triggers: None.
- Estimated Impact: Negligible performance impact. The new table is small and queries will be simple.
*/

-- 1. Add new keys to app_config for Markets page content
INSERT INTO public.app_config (key, value)
VALUES
    ('markets_page_title', 'Markets'),
    ('markets_page_subtitle', 'Explore real-time prices and market activity for all available pairs.')
ON CONFLICT (key) DO NOTHING;


-- 2. Create the market_data table
CREATE TABLE IF NOT EXISTS public.market_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    from_currency_symbol text NOT NULL,
    to_currency_symbol text NOT NULL,
    last_price numeric NOT NULL,
    change_24h_percentage numeric NOT NULL,
    volume_24h_usd numeric NOT NULL,
    CONSTRAINT market_data_pkey PRIMARY KEY (id)
);

-- 3. Setup RLS for the new table
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for market_data
DROP POLICY IF EXISTS "Allow public read access on market_data" ON public.market_data;
CREATE POLICY "Allow public read access on market_data"
ON public.market_data
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow admin full access on market_data" ON public.market_data;
CREATE POLICY "Allow admin full access on market_data"
ON public.market_data
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
