/*
# [Feature] Add Market Data Management
This migration introduces a new table `market_data` to store display values for the Markets page, such as price, change, and volume. It also adds a function `get_market_data` to easily fetch this information and a trigger to automatically update timestamps.

## Query Description: [This operation adds a new table and related functions to your database. It is non-destructive and safe to run on an existing database. It will allow you to manage the content of the "Markets" page from the admin panel.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Tables Added:
  - `public.market_data`: Stores editable market statistics for each exchange pair.
- Functions Added:
  - `public.get_market_data()`: A function to retrieve all exchange pairs along with their corresponding market data.
  - `public.handle_updated_at()`: A utility trigger function to manage `updated_at` timestamps.
- Triggers Added:
  - `on_market_data_updated`: Automatically updates the `updated_at` column on the `market_data` table.
- RLS Policies Added:
  - Public read-only access for `market_data`.
  - Full access for admins on `market_data`.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [Admin role required for modification.]

## Performance Impact:
- Indexes: [Primary key and foreign key indexes are created.]
- Triggers: [One trigger added for timestamp updates.]
- Estimated Impact: [Low. The new table and function are optimized for read performance on the markets page.]
*/

-- 1. Create the market_data table
CREATE TABLE public.market_data (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    pair_id uuid NOT NULL,
    last_price numeric NOT NULL DEFAULT 0,
    change_24h numeric NOT NULL DEFAULT 0,
    volume_24h numeric NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT market_data_pkey PRIMARY KEY (id),
    CONSTRAINT market_data_pair_id_key UNIQUE (pair_id),
    CONSTRAINT market_data_pair_id_fkey FOREIGN KEY (pair_id) REFERENCES public.exchange_pairs(id) ON DELETE CASCADE
);

-- 2. Add comments to the new table and columns
COMMENT ON TABLE public.market_data IS 'Stores editable market data for display on the markets page.';
COMMENT ON COLUMN public.market_data.pair_id IS 'Links to the exchange_pairs table.';
COMMENT ON COLUMN public.market_data.last_price IS 'The manually set last price for the pair.';
COMMENT ON COLUMN public.market_data.change_24h IS 'The manually set 24-hour percentage change (e.g., 0.05 for 5%).';
COMMENT ON COLUMN public.market_data.volume_24h IS 'The manually set 24-hour volume in USD.';

-- 3. Create a trigger function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply the trigger to the new market_data table
CREATE TRIGGER on_market_data_updated
BEFORE UPDATE ON public.market_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable RLS on the new table
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Allow public read access"
ON public.market_data
FOR SELECT
USING (true);

CREATE POLICY "Allow admin full access"
ON public.market_data
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 7. Create an RPC function to fetch market data easily
CREATE OR REPLACE FUNCTION public.get_market_data()
RETURNS TABLE (
    pair_id uuid,
    "from" text,
    "to" text,
    last_price numeric,
    change_24h numeric,
    volume_24h numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        ep.id as pair_id,
        ep."from",
        ep."to",
        COALESCE(md.last_price, 0) as last_price,
        COALESCE(md.change_24h, 0) as change_24h,
        COALESCE(md.volume_24h, 0) as volume_24h
    FROM
        public.exchange_pairs ep
    LEFT JOIN
        public.market_data md ON ep.id = md.pair_id
    ORDER BY
        ep.created_at;
$$;
