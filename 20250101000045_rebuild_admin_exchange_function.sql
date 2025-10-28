/*
# [Function Rebuild] Rebuild `get_admin_exchanges`
This migration rebuilds the `get_admin_exchanges` function to ensure it correctly fetches all exchange data for the admin panel.

## Query Description:
This operation drops and recreates a database function. It is a non-destructive change to the data schema itself, but it is critical for the admin panel's functionality. The new function uses `SECURITY DEFINER` to bypass Row-Level Security policies while including an explicit check to ensure only authorized administrators can execute it. This resolves issues where RLS policies might have incorrectly hidden exchange data from admins.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (by restoring the previous function definition)

## Structure Details:
- Drops function: `public.get_admin_exchanges()`
- Creates function: `public.get_admin_exchanges()`

## Security Implications:
- RLS Status: The function is designed to bypass RLS for data fetching.
- Policy Changes: No
- Auth Requirements: The function explicitly checks if the calling user has the 'admin' role.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Performance should be similar to the previous function.
*/

-- Drop the existing function if it exists to avoid conflicts.
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

-- Recreate the function with a security-definer context and an explicit admin check.
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
-- Set a secure search_path to prevent hijacking.
SET search_path = public
AS $$
BEGIN
  -- First, verify that the user calling this function is an admin.
  -- This is a critical security check for a SECURITY DEFINER function.
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin.';
  END IF;

  -- If the check passes, return the query results.
  -- This query joins exchanges with user and profile data.
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
        u.id AS user_id,
        p.username,
        u.email,
        p.avatar_url
    FROM
        public.exchanges e
    LEFT JOIN
        auth.users u ON e.user_id = u.id
    LEFT JOIN
        public.profiles p ON u.id = p.id
    ORDER BY
        e.created_at DESC;
END;
$$;

-- Grant execute permission on the function to the authenticated role.
-- The internal function logic will handle the admin check.
GRANT EXECUTE ON FUNCTION public.get_admin_exchanges() TO authenticated;
