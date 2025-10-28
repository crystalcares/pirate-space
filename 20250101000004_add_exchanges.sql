/*
          # [Operation Name]
          Create Exchanges Table and ID Generation Function

          ## Query Description: [This migration creates a new `exchanges` table to store transaction details. It also sets up a function and trigger to automatically generate a human-readable, sequential ID (e.g., `EX-2025-0001`) for each new exchange. Row Level Security is enabled to ensure users can only see their own exchanges, while still allowing anonymous users to create them.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Tables Added: `public.exchanges`
          - Functions Added: `public.generate_exchange_id()`
          - Triggers Added: `tr_generate_exchange_id` on `public.exchanges`
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Policies are defined for both authenticated and anonymous users.]
          
          ## Performance Impact:
          - Indexes: [Primary key and foreign key indexes are created automatically.]
          - Triggers: [A `BEFORE INSERT` trigger is added, with minimal performance impact on inserts.]
          - Estimated Impact: [Low. This is a standard table addition.]
          */

CREATE TABLE public.exchanges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    exchange_id text NOT NULL,
    user_id uuid NULL,
    from_currency text NOT NULL,
    to_currency text NOT NULL,
    send_amount numeric NOT NULL,
    receive_amount numeric NOT NULL,
    fee_amount numeric NOT NULL,
    fee_details text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    CONSTRAINT exchanges_pkey PRIMARY KEY (id),
    CONSTRAINT exchanges_exchange_id_key UNIQUE (exchange_id),
    CONSTRAINT exchanges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.exchanges FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow individual select access" ON public.exchanges FOR SELECT USING (
  (auth.uid() = user_id) OR (user_id IS NULL)
);

CREATE OR REPLACE FUNCTION public.generate_exchange_id()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    last_sequence INT;
    new_sequence INT;
BEGIN
    current_year := to_char(NEW.created_at, 'YYYY');
    
    SELECT COALESCE(MAX(SUBSTRING(exchange_id FROM 8)::INT), 0)
    INTO last_sequence
    FROM public.exchanges
    WHERE SUBSTRING(exchange_id FROM 4 FOR 4) = current_year;
    
    new_sequence := last_sequence + 1;
    
    NEW.exchange_id := 'EX-' || current_year || '-' || LPAD(new_sequence::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_exchange_id
BEFORE INSERT ON public.exchanges
FOR EACH ROW
EXECUTE FUNCTION public.generate_exchange_id();
