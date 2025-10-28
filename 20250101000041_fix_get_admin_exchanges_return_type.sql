/*
# [Operation Name]
Recreate get_admin_exchanges Function

## Query Description: [This operation drops and recreates the `get_admin_exchanges` function to fix a return type mismatch. The function's `SELECT` statement columns were not perfectly aligned with its `RETURNS TABLE` definition. This new version ensures they match, resolving the "structure of query does not match function result type" error. This is a safe, non-destructive change to the function's logic.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [false]

## Structure Details:
- Function `get_admin_exchanges` will be dropped and recreated.

## Security Implications:
- RLS Status: [N/A]
- Policy Changes: [No]
- Auth Requirements: [The function remains `SECURITY DEFINER` to access user details.]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Negligible performance impact.]
*/

-- Drop the existing function to ensure a clean recreation
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

-- Recreate the function with the correct return type and explicit column selection
CREATE OR REPLACE FUNCTION public.get_admin_exchanges()
RETURNS TABLE (
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
    avatar_url text,
    payment_method_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
        u.email, -- Select email from auth.users
        p.avatar_url,
        e.payment_method_id
    FROM
        exchanges e
    LEFT JOIN
        profiles p ON e.user_id = p.id
    LEFT JOIN
        auth.users u ON e.user_id = u.id -- Join auth.users to get the email
    ORDER BY
        e.created_at DESC;
END;
$$;
