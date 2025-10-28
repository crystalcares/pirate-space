/*
# [Enhancement] Update Admin Exchange Function
This migration updates the `get_admin_exchanges` function to include the newly added `recipient_wallet_address` column in its result set.

## Query Description:
This operation recreates the `get_admin_exchanges` function with an updated `RETURNS TABLE` definition and `SELECT` statement. The new version of the function will return all previous fields plus the `recipient_wallet_address`, making this information available to the admin dashboard.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false

## Structure Details:
- Function Modified: `public.get_admin_exchanges()`

## Security Implications:
- RLS Status: N/A (Function security is `DEFINER`)
- Policy Changes: No
- Auth Requirements: The function is `SECURITY DEFINER` and checks if the caller is an admin.

## Performance Impact:
- Indexes: None.
- Triggers: None.
- Estimated Impact: Negligible. Recreating a function is a very fast operation.
*/

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
    recipient_wallet_address text, -- Added column
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
  -- Check if the user is an admin
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
    e.recipient_wallet_address, -- Added column
    u.id as user_id,
    p.username,
    u.email,
    p.avatar_url
  FROM
    public.exchanges e
  LEFT JOIN
    auth.users u ON e.user_id = u.id
  LEFT JOIN
    public.profiles p ON e.user_id = p.id
  ORDER BY
    e.created_at DESC;
END;
$$;
