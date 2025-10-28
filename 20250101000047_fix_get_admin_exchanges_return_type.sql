/*
# [Function Fix] Recreate `get_admin_exchanges` function
This migration drops and recreates the `get_admin_exchanges` function to ensure its return signature matches the client-side TypeScript types, resolving a mismatch error.

## Query Description:
- **DROP FUNCTION**: Safely removes the existing `get_admin_exchanges` function.
- **CREATE OR REPLACE FUNCTION**: Recreates the function with the correct column list and order in the `RETURNS TABLE` clause.
- **SELECT Statement**: The internal query is updated to select the exact columns defined in the return type, ensuring perfect alignment.
This operation is non-destructive to data and only affects a server-side function definition.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by restoring the previous function definition)

## Structure Details:
- Function affected: `public.get_admin_exchanges()`

## Security Implications:
- RLS Status: Not applicable to function definition.
- Policy Changes: No
- Auth Requirements: The function maintains its `SECURITY DEFINER` property and internal admin check.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Function recreation is a metadata operation.
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
    IF NOT is_admin(auth.uid()) THEN
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
        exchanges e
    LEFT JOIN
        profiles p ON e.user_id = p.id
    LEFT JOIN
        auth.users u ON e.user_id = u.id
    ORDER BY
        e.created_at DESC;
END;
$$;
