/*
          # [Operation Name]
          Add Payout Details to Exchanges

          [Description of what this operation does]
          This migration adds a new `payout_details` column to the `exchanges` table to store user payout information for sell-side transactions. It also updates the `get_admin_exchanges` function to include this new field, making it visible to administrators.

          ## Query Description: [This operation is safe and non-destructive. It adds a nullable column to an existing table and recreates a function to expose this new column. No existing data will be modified or lost. This change is essential for processing fiat payouts to users.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - `public.exchanges`: Adds column `payout_details` (TEXT, NULL).
          - `public.get_admin_exchanges`: Recreates the function to include `payout_details` in its return table.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [The updated function remains admin-only.]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Negligible performance impact.]
          */

ALTER TABLE public.exchanges
ADD COLUMN payout_details TEXT NULL;

COMMENT ON COLUMN public.exchanges.payout_details IS 'Stores user-provided payout information for sell-side (crypto-to-fiat) exchanges, e.g., PayPal email or bank details.';

-- Recreate the function to include the new column
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

CREATE OR REPLACE FUNCTION public.get_admin_exchanges()
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
    exchange_id text,
    from_currency text,
    to_currency text,
    send_amount double precision,
    receive_amount double precision,
    fee_amount double precision,
    fee_details text,
    status text,
    recipient_wallet_address text,
    payout_details text, -- Added column
    user_id uuid,
    username text,
    email text,
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This function is intended for admin use only.
    -- A check should be in place to verify the caller's role.
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;

    RETURN QUERY
    SELECT
        e.id,
        e.created_at,
        e.exchange_id,
        e.from_currency,
        e.to_currency,
        e.send_amount,
        e.receive_amount,
        e.fee_amount,
        e.fee_details,
        e.status,
        e.recipient_wallet_address,
        e.payout_details, -- Select the new column
        e.user_id,
        p.username,
        u.email,
        p.avatar_url
    FROM
        public.exchanges e
    LEFT JOIN
        public.profiles p ON e.user_id = p.id
    LEFT JOIN
        auth.users u ON e.user_id = u.id
    ORDER BY
        e.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_admin_exchanges() IS 'Fetches all exchange records with associated user details, including payout information, for administrative purposes.';
