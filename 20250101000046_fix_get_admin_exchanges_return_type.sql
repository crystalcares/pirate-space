/*
# [Operation Name]
Fix get_admin_exchanges function return type

## Query Description: [This operation drops and recreates the `get_admin_exchanges` database function. The original function's return columns did not match what the application frontend expected, causing data fetching errors in the admin panel. This new version ensures the function returns all necessary fields (including user details like username, email, and avatar) with the correct data types, resolving the "structure of query does not match function result type" error. No existing data is modified by this change.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Functions affected: `public.get_admin_exchanges`

## Security Implications:
- RLS Status: [Not Applicable]
- Policy Changes: [No]
- Auth Requirements: [The function remains protected and can only be executed by users with the 'admin' role.]

## Performance Impact:
- Indexes: [Not Applicable]
- Triggers: [Not Applicable]
- Estimated Impact: [Negligible. The function's performance is unchanged.]
*/
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

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
    recipient_wallet_address text,
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
    -- Ensure the user is an admin before proceeding
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: User is not an admin.';
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
