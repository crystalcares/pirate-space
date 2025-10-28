/*
          # [Operation Name]
          Rebuild get_admin_exchanges Function

          ## Query Description: This operation completely drops and recreates the `get_admin_exchanges` function to permanently fix data type and column mismatch errors. The new function uses explicit JOINs between `public.exchanges`, `public.profiles`, and `auth.users` to reliably fetch user details like email. It is built with `SECURITY DEFINER` and an embedded `search_path` to ensure it runs correctly and securely regardless of the calling context. This is a safe, non-destructive change that only affects the function's definition.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Drops function: `public.get_admin_exchanges()`
          - Creates function: `public.get_admin_exchanges()`
          
          ## Security Implications:
          - RLS Status: Not applicable
          - Policy Changes: No
          - Auth Requirements: The function is `SECURITY DEFINER` to allow access to `auth.users` schema.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. Improves reliability of data fetching for the admin dashboard.
          */

-- Drop the existing function to ensure a clean slate
DROP FUNCTION IF EXISTS public.get_admin_exchanges();

-- Recreate the function with a robust and explicit definition
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
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
-- Set the search path inside the function to guarantee schema access
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
        u.email, -- Explicitly select email from the auth.users table
        p.avatar_url
    FROM
        public.exchanges AS e
    LEFT JOIN
        public.profiles AS p ON e.user_id = p.id
    LEFT JOIN
        auth.users AS u ON p.id = u.id -- Correctly join profiles to auth.users
    ORDER BY
        e.created_at DESC;
END;
$$;
