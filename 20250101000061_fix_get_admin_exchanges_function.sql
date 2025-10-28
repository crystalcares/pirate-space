/*
# [Function: Recreate get_admin_exchanges]
This migration safely drops and recreates the `get_admin_exchanges` function to resolve a signature mismatch error during migration.

## Query Description:
This operation first removes the existing `get_admin_exchanges` function to prevent conflicts when its return type is modified. It then recreates the function with the correct column structure expected by the application frontend. This function is used by the admin dashboard to fetch a comprehensive list of all exchanges, including user details. This change is necessary to align the database with the application's data requirements and fix the migration failure.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false (The old function definition is lost, but it is being replaced by the correct one.)

## Structure Details:
- Drops function: `public.get_admin_exchanges`
- Creates function: `public.get_admin_exchanges` with an updated `RETURNS TABLE` definition.

## Security Implications:
- RLS Status: Not applicable to functions directly, but the function is set with `SECURITY DEFINER`.
- Policy Changes: No
- Auth Requirements: The function is designed to be called by an authenticated user with admin privileges; this is handled by application logic.

## Performance Impact:
- Indexes: No changes.
- Triggers: No changes.
- Estimated Impact: Negligible. The function performs joins on indexed columns.
*/

-- Drop the function if it exists to prevent signature mismatch errors
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

-- Recreate the function with the correct return signature
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
