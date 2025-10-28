/*
  # [Function] `get_exchange_id`
  Creates a function to generate a unique, human-readable ID for exchanges.

  ## Query Description: 
  This operation creates a new database function. It is safe to run and has no impact on existing data. It sets the search_path to prevent security issues.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (the function can be dropped)
  
  ## Security Implications:
  - RLS Status: N/A
  - Policy Changes: No
  - Auth Requirements: None
*/
CREATE OR REPLACE FUNCTION public.get_exchange_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  random_part TEXT;
  current_ts BIGINT;
  result_id TEXT;
BEGIN
  -- Generate a 6-character random string from a-z, 0-9
  random_part := array_to_string(
    (SELECT array_agg(substr('abcdefghijklmnopqrstuvwxyz0123456789', floor(random() * 36)::int + 1, 1))
     FROM generate_series(1, 6)), ''
  );
  
  -- Get current timestamp as milliseconds
  current_ts := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  
  -- Concatenate and format
  result_id := 'EX-' || current_ts || '-' || random_part;
  
  RETURN result_id;
END;
$$ SET search_path = ''; -- Fix for security advisory

/*
  # [Table] `exchanges`
  Creates the table to store transaction details.

  ## Query Description: 
  This operation creates the `exchanges` table if it does not already exist. It is designed to be safe to re-run. It will not delete or modify any existing data.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (the table can be dropped)
  
  ## Structure Details:
  - Table: exchanges
  - Columns: id, created_at, user_id, exchange_id, from_currency, to_currency, send_amount, receive_amount, fee_amount, fee_details, status
  
  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes (new policies will be created)
  - Auth Requirements: Policies allow public inserts but restricted reads.
*/
CREATE TABLE IF NOT EXISTS public.exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    exchange_id TEXT NOT NULL UNIQUE DEFAULT public.get_exchange_id(),
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    send_amount NUMERIC(18, 8) NOT NULL,
    receive_amount NUMERIC(18, 8) NOT NULL,
    fee_amount NUMERIC(18, 8) NOT NULL,
    fee_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts if the script is re-run
DROP POLICY IF EXISTS "Allow public insert for anyone" ON public.exchanges;
DROP POLICY IF EXISTS "Allow individual read access" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin full access" ON public.exchanges;

-- Policies
CREATE POLICY "Allow public insert for anyone"
ON public.exchanges
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow individual read access"
ON public.exchanges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow admin full access"
ON public.exchanges
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
