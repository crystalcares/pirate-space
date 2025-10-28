/*
# [Function Fix] Rebuild Admin Exchange Fetcher
[Description]
This migration performs a definitive fix for the "failed to fetch exchanges" error in the admin panel. It completely drops the existing `get_admin_exchanges` function and recreates it from scratch. This new version includes explicit type casting on all joined columns to eliminate any possible type mismatches between the function's return signature and the query's output, which is the likely cause of the persistent "structure of query does not match" error.

## Query Description: [This operation rebuilds a key database function for the admin panel. It is a safe and necessary fix that does not affect any user data. Applying this migration should resolve the data fetching errors on the admin dashboard and orders page.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Drops and recreates the `public.get_admin_exchanges` function.

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [The function remains protected by an admin check.]

## Performance Impact:
- Indexes: [Not Applicable]
- Triggers: [Not Applicable]
- Estimated Impact: [None. This is a function definition change.]
*/

-- Drop the function completely to ensure a clean rebuild
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

-- Recreate the function with explicit casts for maximum safety
CREATE OR REPLACE FUNCTION public.get_admin_exchanges()
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    exchange_id text,
    from_currency text,
    to_currency text,
    send_amount numeric,
    receive_amount numeric,
    fee_amount numeric,
    fee_details text,
    status text,
    recipient_wallet_address text,
    user_id uuid,
    username text,
    email text,
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Security barrier to ensure only admins can execute this
    IF NOT public.is_admin(auth.uid()) THEN
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
        e.user_id,
        CAST(p.username AS text),
        CAST(u.email AS text),
        CAST(p.avatar_url AS text)
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

-- Set the search_path for security and to ensure `auth` schema is accessible
ALTER FUNCTION public.get_admin_exchanges() SET search_path = public, auth;
