/*
# [Fix] Correct Search Path for Admin Exchange Function
[This migration fixes the `get_admin_exchanges` function by updating its `search_path` to include the `auth` schema. This allows the function to correctly join with the `auth.users` table to fetch user emails, resolving the "structure of query does not match function result type" error.]

## Query Description: [This operation drops and recreates a single database function. It is a non-destructive change to the function's definition and does not affect any stored data. The fix is critical for the admin dashboard's functionality.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Function(s) affected: `public.get_admin_exchanges`

## Security Implications:
- RLS Status: [N/A]
- Policy Changes: [No]
- Auth Requirements: [The function is `SECURITY DEFINER` and requires this to access `auth.users`.]

## Performance Impact:
- Indexes: [N/A]
- Triggers: [N/A]
- Estimated Impact: [None. This is a definition change.]
*/

DROP FUNCTION IF EXISTS public.get_admin_exchanges();

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
    user_id uuid,
    username text,
    email text,
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
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
