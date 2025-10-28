/*
# [Operation Name]
Harden get_admin_exchanges function

## Query Description: [This operation will drop and recreate the `get_admin_exchanges` function to ensure its stability and security. It explicitly sets the `search_path` within the function definition and adds an admin check, making it resilient to environment changes and resolving persistent data fetching errors in the admin panel. This is a safe, non-destructive operation focused on improving function reliability.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Drops the existing `get_admin_exchanges` function.
- Recreates the `get_admin_exchanges` function with an explicit `SET search_path` and an internal admin role check.

## Security Implications:
- RLS Status: Not applicable
- Policy Changes: No
- Auth Requirements: Admin privileges to modify functions.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Improves function call reliability and security.
*/

-- Drop the existing function to ensure a clean slate
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

-- Recreate the function with explicit search_path and robust joins
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
-- Set the search path explicitly to ensure it finds tables in the 'public' and 'auth' schemas
SET search_path = public, auth;
AS $$
BEGIN
  -- Check if the calling user is an admin
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
      p.id AS user_id,
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

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.get_admin_exchanges() TO authenticated;
